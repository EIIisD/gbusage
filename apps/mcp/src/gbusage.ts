import type { CliInvocation } from './cli-utils.ts';
import { z } from 'zod';
import { createCliInvocation, executeCliCommand, resolveBinaryPath } from './cli-utils.ts';
import { DATE_FILTER_REGEX } from './consts.ts';

export const filterDateSchema = z.string()
	.regex(DATE_FILTER_REGEX, 'Date must be in YYYYMMDD format');

export const gbusageParametersShape = {
	since: filterDateSchema.optional(),
	until: filterDateSchema.optional(),
	mode: z.enum(['auto', 'calculate', 'display']).default('auto').optional(),
	timezone: z.string().optional(),
	locale: z.string().optional(),
} as const satisfies Record<string, z.ZodTypeAny>;

export const gbusageParametersSchema = z.object(gbusageParametersShape);

let cachedGbusageInvocation: CliInvocation | null = null;

function getGbusageInvocation(): CliInvocation {
	if (cachedGbusageInvocation != null) {
		return cachedGbusageInvocation;
	}

	const entryPath = resolveBinaryPath('gbusage', 'gbusage');
	cachedGbusageInvocation = createCliInvocation(entryPath);
	return cachedGbusageInvocation;
}

async function runGbusageCliJson(
	command: 'daily' | 'monthly' | 'session' | 'blocks',
	parameters: z.infer<typeof gbusageParametersSchema>,
	claudePath: string,
): Promise<string> {
	const { executable, prefixArgs } = getGbusageInvocation();
	const cliArgs: string[] = [...prefixArgs, command, '--json'];

	const since = parameters.since;
	if (since != null && since !== '') {
		cliArgs.push('--since', since);
	}
	const until = parameters.until;
	if (until != null && until !== '') {
		cliArgs.push('--until', until);
	}
	const mode = parameters.mode;
	if (mode != null && mode !== 'auto') {
		cliArgs.push('--mode', mode);
	}
	const timezone = parameters.timezone;
	if (timezone != null && timezone !== '') {
		cliArgs.push('--timezone', timezone);
	}
	const locale = parameters.locale;
	if (locale != null && locale !== '') {
		cliArgs.push('--locale', locale);
	}

	return executeCliCommand(executable, cliArgs, {
		// Set Claude path for gbusage
		CLAUDE_CONFIG_DIR: claudePath,
	});
}

export async function getGbusageDaily(parameters: z.infer<typeof gbusageParametersSchema>, claudePath: string): Promise<unknown> {
	try {
		const raw = await runGbusageCliJson('daily', parameters, claudePath);
		const parsed = JSON.parse(raw) as unknown;
		// If the parsed result is an empty array, convert to expected structure
		if (Array.isArray(parsed) && parsed.length === 0) {
			return { daily: [], totals: {} };
		}
		return parsed;
	}
	catch {
		// Return empty result on error
		return { daily: [], totals: {} };
	}
}

export async function getGbusageMonthly(parameters: z.infer<typeof gbusageParametersSchema>, claudePath: string): Promise<unknown> {
	try {
		const raw = await runGbusageCliJson('monthly', parameters, claudePath);
		const parsed = JSON.parse(raw) as unknown;
		// If the parsed result is an empty array, convert to expected structure
		if (Array.isArray(parsed) && parsed.length === 0) {
			return { monthly: [], totals: {} };
		}
		return parsed;
	}
	catch {
		// Return empty result on error
		return { monthly: [], totals: {} };
	}
}

export async function getGbusageSession(parameters: z.infer<typeof gbusageParametersSchema>, claudePath: string): Promise<unknown> {
	try {
		const raw = await runGbusageCliJson('session', parameters, claudePath);
		const parsed = JSON.parse(raw) as unknown;
		// If the parsed result is an empty array, convert to expected structure
		if (Array.isArray(parsed) && parsed.length === 0) {
			return { sessions: [], totals: {} };
		}
		return parsed;
	}
	catch {
		// Return empty result on error
		return { sessions: [], totals: {} };
	}
}

export async function getGbusageBlocks(parameters: z.infer<typeof gbusageParametersSchema>, claudePath: string): Promise<unknown> {
	try {
		const raw = await runGbusageCliJson('blocks', parameters, claudePath);
		const parsed = JSON.parse(raw) as unknown;
		// If the parsed result is an empty array, convert to expected structure
		if (Array.isArray(parsed) && parsed.length === 0) {
			return { blocks: [] };
		}
		return parsed;
	}
	catch {
		// Return empty result on error
		return { blocks: [] };
	}
}
