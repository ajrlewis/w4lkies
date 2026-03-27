
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Bitcoin value with spaces for better readability
 * @param value - Bitcoin value as string or number
 * @returns Formatted string with spaces (e.g. "0.00 062 978 BTC")
 */
export function formatBitcoin(value: string | number): string {
  // Convert to string if number
  const valueStr = typeof value === 'number' ? value.toString() : value;
  
  // Split by decimal point
  const parts = valueStr.split('.');
  const wholePart = parts[0];
  
  // If there's no decimal part, return the whole part with BTC
  if (!parts[1]) {
    return `${wholePart} BTC`;
  }
  
  // Format decimal part with spaces every 3 digits
  const decimalPart = parts[1];
  let formattedDecimal = '';
  
  // Add space every 3 characters
  for (let i = 0; i < decimalPart.length; i++) {
    formattedDecimal += decimalPart[i];
    // Add space after every 3rd digit, but not at the end
    if ((i + 1) % 3 === 0 && i !== decimalPart.length - 1) {
      formattedDecimal += ' ';
    }
  }
  
  // Return formatted string
  return `${wholePart}.${formattedDecimal} BTC`;
}
