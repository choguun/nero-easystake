import { ethers, BigNumberish } from 'ethers';

/**
 * Safely formats a BigNumberish value into a string representation.
 * @param value The value to format.
 * @param decimals The number of decimals to use for formatting.
 * @returns The formatted string, or '0.0' if formatting fails.
 */
export function formatUnitsSafe(
  value: BigNumberish | undefined | null,
  decimals: string | number | undefined
): string {
  if (value === undefined || value === null || decimals === undefined) {
    return '0.0';
  }
  try {
    return ethers.utils.formatUnits(value, decimals);
  } catch (error) {
    console.error('Error formatting units:', error, { value, decimals });
    return '0.0';
  }
}

/**
 * Safely parses a string value into a BigNumber.
 * @param value The string value to parse.
 * @param decimals The number of decimals the string value represents.
 * @returns The parsed BigNumber, or BigNumber(0) if parsing fails.
 */
export function parseUnitsSafe(
  value: string | undefined | null,
  decimals: string | number | undefined
): ethers.BigNumber {
  if (value === undefined || value === null || value.trim() === '' || decimals === undefined) {
    return ethers.BigNumber.from(0);
  }
  try {
    const parsedValue = ethers.utils.parseUnits(value, decimals);
    return parsedValue;
  } catch (error) {
    console.error('Error parsing units:', error, { value, decimals });
    return ethers.BigNumber.from(0);
  }
} 