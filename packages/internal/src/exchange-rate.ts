/**
 * Exchange rate fetcher with file-based caching for USD to GBP conversion
 * Uses the free ExchangeRate-API endpoint (refreshes every 10 minutes)
 * Persists rate to file for immediate availability on next run
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_RATE = 0.79;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Cache file location: ~/.ccusage/exchange-rate.json
const CACHE_DIR = join(homedir(), '.ccusage');
const CACHE_FILE = join(CACHE_DIR, 'exchange-rate.json');

type ExchangeRateResponse = {
	result: string;
	base_code: string;
	rates: Record<string, number>;
};

type CachedRate = {
	rate: number;
	fetchedAt: number;
};

let cachedRate: CachedRate | null = null;
let fetchPromise: Promise<number> | null = null;

/**
 * Load cached rate from file (synchronous, called on module load)
 */
function loadCachedRateFromFile(): CachedRate | null {
	try {
		if (!existsSync(CACHE_FILE)) {
			return null;
		}
		const content = readFileSync(CACHE_FILE, 'utf-8');
		const data = JSON.parse(content) as CachedRate;

		if (typeof data.rate === 'number' && typeof data.fetchedAt === 'number') {
			return data;
		}
		return null;
	}
	catch {
		return null;
	}
}

/**
 * Save cached rate to file
 */
function saveCachedRateToFile(data: CachedRate): void {
	try {
		if (!existsSync(CACHE_DIR)) {
			mkdirSync(CACHE_DIR, { recursive: true });
		}
		writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf-8');
	}
	catch {
		// Silently fail - file caching is best-effort
	}
}

// Load cached rate from file on module initialization
cachedRate = loadCachedRateFromFile();

/**
 * Fetches the current USD to GBP exchange rate from the API
 * Results are cached in memory and persisted to file for 10 minutes
 * @returns The exchange rate (e.g., 0.79 means 1 USD = 0.79 GBP)
 */
export async function fetchUsdToGbpRate(): Promise<number> {
	// Return cached rate if still valid
	if (cachedRate != null && Date.now() - cachedRate.fetchedAt < CACHE_DURATION_MS) {
		return cachedRate.rate;
	}

	// Prevent multiple concurrent fetches
	if (fetchPromise != null) {
		return fetchPromise;
	}

	fetchPromise = (async () => {
		try {
			const response = await fetch(EXCHANGE_RATE_API_URL);

			if (!response.ok) {
				throw new Error(`API Error: ${response.statusText}`);
			}

			const data = await response.json() as ExchangeRateResponse;

			if (data.result !== 'success') {
				throw new Error('API returned unsuccessful result');
			}

			const gbpRate = data.rates.GBP;

			if (gbpRate == null || typeof gbpRate !== 'number') {
				throw new Error('GBP rate not found in response');
			}

			cachedRate = {
				rate: gbpRate,
				fetchedAt: Date.now(),
			};

			// Persist to file for next run
			saveCachedRateToFile(cachedRate);

			return gbpRate;
		}
		catch {
			// Return fallback rate on any error
			return cachedRate?.rate ?? FALLBACK_RATE;
		}
		finally {
			fetchPromise = null;
		}
	})();

	return fetchPromise;
}

/**
 * Gets the current exchange rate synchronously
 * Returns file-cached rate if available, otherwise fallback
 * Call initializeExchangeRate() at app startup to refresh if stale
 * @returns The exchange rate
 */
export function getUsdToGbpRate(): number {
	if (cachedRate != null) {
		return cachedRate.rate;
	}
	return FALLBACK_RATE;
}

/**
 * Initialize the exchange rate cache
 * Loads from file immediately, then fetches fresh rate if stale
 * @returns Promise that resolves when rate is fetched
 */
export async function initializeExchangeRate(): Promise<number> {
	return fetchUsdToGbpRate();
}

/**
 * Converts USD to GBP using the current exchange rate
 * @param usdAmount - Amount in USD
 * @returns Amount in GBP
 */
export function convertUsdToGbp(usdAmount: number): number {
	return usdAmount * getUsdToGbpRate();
}

/**
 * Reset the cache (mainly for testing)
 */
export function resetExchangeRateCache(): void {
	cachedRate = null;
	fetchPromise = null;
}
