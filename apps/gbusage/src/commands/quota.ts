import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import { ResponsiveTable } from '@gbusage/terminal/table';
import { define } from 'gunshi';
import pc from 'picocolors';
import prettyMs from 'pretty-ms';
import { sharedCommandConfig } from '../_shared-args.ts';
import { log, logger } from '../logger.ts';

const execFileAsync = promisify(execFile);

type QuotaLimit = {
	utilization: number;
	resets_at: string;
};

type QuotaResponse = {
	five_hour?: QuotaLimit;
	seven_day?: QuotaLimit;
	// Allow for other potential keys
	[key: string]: QuotaLimit | undefined;
};

async function getEnvToken(): Promise<string | undefined> {
	return process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.CLAUDE_OAUTH_TOKEN;
}

async function getKeychainToken(): Promise<string | null> {
	try {
		const { stdout } = await execFileAsync('security', ['find-generic-password', '-s', 'Claude Code-credentials', '-w']);
		const secret = JSON.parse(stdout.trim());
		return secret.claudeAiOauth?.accessToken ?? null;
	}
	catch {
		return null;
	}
}

export const quotaCommand = define({
	name: 'quota',
	description: 'Show official Claude Code API quota and limits',
	...sharedCommandConfig,
	args: {
		...sharedCommandConfig.args,
		token: {
			type: 'string',
			description: 'Manual OAuth token override',
			optional: true,
		},
	},
	async run(ctx) {
		const MAX_RETRIES = 2;
		let attempts = 0;
		// Track if we are currently forcing a keychain refresh (ignoring env var)
		let forceKeychain = false;

		while (attempts <= MAX_RETRIES) {
			// Determine which token to use
			let token: string | null = ctx.values.token ?? null;

			// If no manual token provided
			if (!token) {
				// 1. Try Env Var (unless forcing keychain)
				if (!forceKeychain) {
					token = await getEnvToken() ?? null;
				}

				// 2. Fallback to Keychain
				if (!token) {
					token = await getKeychainToken();
				}
			}

			if (!token) {
				logger.error('Could not find Claude OAuth token in Environment or Keychain.');
				logger.info('Please run `claude` once to authenticate, or provide a token with --token.');
				process.exit(1);
			}

			if (attempts === 0) {
				logger.info('Fetching quota from Anthropic...');
			}

			try {
				const response = await fetch('https://api.anthropic.com/api/oauth/usage', {
					headers: {
						'Authorization': `Bearer ${token}`,
						'User-Agent': 'Claude/3.5 (gbusage quota)',
						'anthropic-beta': 'oauth-2025-04-20',
					},
				});

				if (response.status === 401 || response.status === 403) {
					const data = await response.json().catch(() => ({})) as any;
					
					// Handle specific errors that warrant a retry/refresh
					// "permission_error" usually means scope mismatch (e.g. env var token is for inference only)
					// "authentication_error" usually means expired token
					const isScopeError = data?.error?.type === 'permission_error';
					const isExpiredError = data?.error?.message?.includes('expired') || data?.error?.message?.includes('token');

					if (isScopeError || isExpiredError) {
						if (attempts < MAX_RETRIES && !ctx.values.token) {
							attempts++;
							
							// If we haven't forced keychain yet, try that first (ignoring env var)
							if (!forceKeychain) {
								logger.warn(`Token rejected (${isScopeError ? 'scope mismatch' : 'expired'}). Switching to Keychain...`);
								forceKeychain = true;
								continue;
							}

							// If we are already on Keychain and it failed, try to refresh it
							logger.warn(`Keychain token rejected. Refreshing (attempt ${attempts}/${MAX_RETRIES})...`);
							try {
								// Run claude --version to trigger internal token refresh
								// IMPORTANT: We must unset the env var so claude uses/updates the keychain
								await execFileAsync('claude', ['--version'], { 
									env: { ...process.env, CLAUDE_CODE_OAUTH_TOKEN: '' } 
								});
								// Small delay to allow keychain update
								await new Promise(resolve => setTimeout(resolve, 1000));
								continue;
							}
							catch {
								logger.warn('Failed to auto-refresh token using `claude --version`');
							}
						}
						else {
							logger.error('Your Claude OAuth token has expired/invalid and auto-refresh failed.');
							logger.info('Please run the following command in your terminal to refresh it manually:');
							logger.info(pc.bold('  CLAUDE_CODE_OAUTH_TOKEN= claude --version'));
							logger.info('Then try this command again.');
							process.exit(1);
						}
					}
					
					logger.error(`Authentication failed: ${response.status} ${response.statusText}`);
					if (data?.error?.message) {
						logger.error(data.error.message);
					}
					process.exit(1);
				}

				if (!response.ok) {
					logger.error(`API Error: ${response.status} ${response.statusText}`);
					process.exit(1);
				}

				const data = await response.json() as QuotaResponse;

				const table = new ResponsiveTable({
					head: ['Limit Type', 'Utilization', 'Status', 'Resets In'],
					colAligns: ['left', 'right', 'left', 'right'],
				});

				// Helper to format rows
				const addRow = (name: string, limitData: QuotaLimit | undefined) => {
					if (!limitData) {
						return;
					}

					const resetDate = new Date(limitData.resets_at);
					const now = new Date();
					const diff = resetDate.getTime() - now.getTime();
					const resetsIn = diff > 0 ? prettyMs(diff, { compact: true }) : 'Now';

					const percent = `${(limitData.utilization * 100).toFixed(1)}%`;
					let status = pc.green('OK');
					if (limitData.utilization > 0.8) {
						status = pc.yellow('Warning');
					}
					if (limitData.utilization >= 1.0) {
						status = pc.red('Exceeded');
					}

					table.push([
						name,
						percent,
						status,
						resetsIn,
					]);
				};

				addRow('5-Hour Cap', data.five_hour);
				addRow('7-Day Cap', data.seven_day);

				// If empty
				if ((table as any).rows.length === 0) {
					logger.warn('No quota data returned from API.');
					logger.info('Raw response:', JSON.stringify(data, null, 2));
				}
				else {
					log(table.toString());
				}
				
				// Successful execution, break loop
				break;
			}
			catch (e: any) {
				logger.error(`Failed to fetch quota: ${e.message}`);
				process.exit(1);
			}
		}
	},
});
