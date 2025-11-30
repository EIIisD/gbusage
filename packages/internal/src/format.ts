import { convertUsdToGbp } from './exchange-rate.ts';

/**
 * Format a number as tokens with locale-specific formatting
 * @param value - Token count to format
 * @returns Formatted token string
 */
export function formatTokens(value: number): string {
	return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/**
 * Format a number as GBP currency (converted from USD using cached exchange rate)
 * @param value - Amount in USD to convert
 * @param locale - Locale for formatting (default: 'en-GB')
 * @returns Formatted currency string in GBP
 */
export function formatCurrency(value: number, locale?: string): string {
	const gbpValue = convertUsdToGbp(value);
	return new Intl.NumberFormat(locale ?? 'en-GB', {
		style: 'currency',
		currency: 'GBP',
		minimumFractionDigits: 4,
		maximumFractionDigits: 4,
	}).format(gbpValue);
}
