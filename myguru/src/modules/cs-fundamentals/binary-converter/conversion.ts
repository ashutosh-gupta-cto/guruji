/**
 * Binary / hex / decimal conversion helpers.
 *
 * Ported from solst-ice/bin-hex-dec — interactive digit-by-digit conversion
 * with place-value breakdown.
 *
 * @see https://github.com/solst-ice/bin-hex-dec
 */

export type DigitArray = string[];

export function decimalFromDigits(digits: DigitArray): number {
  const padded = digits.map((d) => (d === '' ? '0' : d));
  return parseInt(padded.join(''), 10);
}

export function digitsFromDecimal(value: number, width = 3): DigitArray {
  const str = value.toString().padStart(width, '0').slice(-width);
  return [...str];
}

export function binaryFromDecimal(value: number, bits = 8): DigitArray {
  return value.toString(2).padStart(bits, '0').split('');
}

export function hexFromDecimal(value: number, digits = 2): DigitArray {
  return value.toString(16).toUpperCase().padStart(digits, '0').split('');
}

export function decimalPowerValue(index: number): number {
  return Math.pow(10, 2 - index);
}

export function binaryPowerValue(index: number, length: number): number {
  return Math.pow(2, length - 1 - index);
}

export function hexPowerValue(index: number, length: number): number {
  return Math.pow(16, length - 1 - index);
}

export function decimalProduct(digits: DigitArray, index: number): number | '' {
  const digit = digits[index];
  return digit === '' ? '' : decimalPowerValue(index) * parseInt(digit, 10);
}

export function binaryProduct(digits: DigitArray, index: number): number | '' {
  const digit = digits[index];
  return digit === '' ? '' : binaryPowerValue(index, digits.length) * parseInt(digit, 2);
}

export function hexProduct(digits: DigitArray, index: number): number | '' {
  const digit = digits[index];
  const digitValue = parseInt(digit, 16);
  return Number.isNaN(digitValue) ? '' : hexPowerValue(index, digits.length) * digitValue;
}

export function sumProducts(
  digits: DigitArray,
  productFn: (digits: DigitArray, index: number) => number | '',
): number | '' {
  if (!digits.some((d) => d !== '')) return '';
  return digits.reduce<number>((sum, digit, index) => {
    const product = productFn(digits, index);
    return sum + (digit === '' || product === '' ? 0 : product);
  }, 0);
}

export function isLeadingZero(array: DigitArray, index: number): boolean {
  if (array[index] !== '0') return false;
  for (let i = 0; i < index; i++) {
    if (array[i] !== '0' && array[i] !== '') return false;
  }
  for (let i = index + 1; i < array.length; i++) {
    if (array[i] !== '0' && array[i] !== '') return true;
  }
  return true;
}

export function isValidDecimalDigit(value: string): boolean {
  return value === '' || (/^\d$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 9);
}

export function isValidBinaryDigit(value: string): boolean {
  return value === '' || /^[01]$/.test(value);
}

export function isValidHexDigit(value: string): boolean {
  return value === '' || /^[0-9A-Fa-f]$/.test(value);
}
