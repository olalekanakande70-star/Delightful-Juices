import { MeasurementUnit, SizeOption } from '../types';

/**
 * Official conversion constants per client specification:
 * - 1 litre = 33.814 US fluid ounces
 * - 1 centilitre = 0.33814 US fluid ounces
 * - 1 millilitre = 0.033814 US fluid ounces
 */
export const OZ_PER_LITRE = 33.814;
export const OZ_PER_CL = 0.33814;
export const OZ_PER_ML = 0.033814;

/**
 * Converts a numeric quantity from a source measurement unit into US fluid ounces (oz).
 * Rounds to 1 decimal place (or clean integer when exact to .0).
 * Never double-converts if unit is already 'oz'.
 */
export function convertToOzNumber(quantity: number, unit: MeasurementUnit): number {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;

  let rawOz = quantity;
  switch (unit) {
    case 'L':
      rawOz = quantity * OZ_PER_LITRE;
      break;
    case 'cl':
      rawOz = quantity * OZ_PER_CL;
      break;
    case 'ml':
      rawOz = quantity * OZ_PER_ML;
      break;
    case 'oz':
    default:
      rawOz = quantity;
      break;
  }

  return Math.round(rawOz * 10) / 10;
}

/**
 * Formats an ounce number cleanly (e.g. 16.9 -> "16.9 oz", 12.0 -> "12 oz").
 */
export function formatOzValue(oz: number): string {
  const rounded = Math.round(oz * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${formatted} oz`;
}

/**
 * Parses a legacy size string (e.g., "35cl", "50cl", "1L", "1.5L", "12 oz", "Pack")
 * into structured { quantityValue, unit } without double converting.
 */
export function parseSizeString(sizeStr: string, labelStr?: string): {
  quantityValue: number;
  unit: MeasurementUnit;
  packBottleQuantity?: number;
  packBottleUnit?: MeasurementUnit;
} {
  const clean = (sizeStr || '').trim();

  if (clean.toLowerCase() === 'pack' || clean.toLowerCase().includes('pack')) {
    // Check if label specifies e.g. "6 x 50cl" or "6 x 16.9 oz"
    const packMatch = (labelStr || clean).match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cl|l|ml|oz)/i);
    if (packMatch) {
      const count = parseFloat(packMatch[1]);
      const bQty = parseFloat(packMatch[2]);
      const rawUnit = packMatch[3].toLowerCase();
      const bUnit: MeasurementUnit =
        rawUnit === 'l' ? 'L' : rawUnit === 'cl' ? 'cl' : rawUnit === 'ml' ? 'ml' : 'oz';
      return {
        quantityValue: count,
        unit: 'Pack',
        packBottleQuantity: bQty,
        packBottleUnit: bUnit,
      };
    }
    return {
      quantityValue: 6,
      unit: 'Pack',
      packBottleQuantity: 50,
      packBottleUnit: 'cl',
    };
  }

  // Match e.g. "35cl", "50 cl", "1L", "1.5 L", "16.9oz", "16.9 oz", "500ml"
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(cl|l|litre|litres|liter|liters|ml|oz|fl\s*oz)$/i);
  if (match) {
    const qty = parseFloat(match[1]);
    const rawU = match[2].toLowerCase();
    if (rawU === 'cl') return { quantityValue: qty, unit: 'cl' };
    if (rawU.startsWith('l')) return { quantityValue: qty, unit: 'L' };
    if (rawU === 'ml') return { quantityValue: qty, unit: 'ml' };
    return { quantityValue: qty, unit: 'oz' };
  }

  // Fallback check on labelStr if sizeStr wasn't standard
  if (labelStr) {
    const lblMatch = labelStr.match(/(\d+(?:\.\d+)?)\s*(cl|l|litre|litres|ml|oz)/i);
    if (lblMatch) {
      const qty = parseFloat(lblMatch[1]);
      const rawU = lblMatch[2].toLowerCase();
      if (rawU === 'cl') return { quantityValue: qty, unit: 'cl' };
      if (rawU.startsWith('l')) return { quantityValue: qty, unit: 'L' };
      if (rawU === 'ml') return { quantityValue: qty, unit: 'ml' };
      return { quantityValue: qty, unit: 'oz' };
    }
  }

  return { quantityValue: 16.9, unit: 'oz' };
}

/**
 * Returns the concise customer-facing ounce badge for a SizeOption (e.g., "11.8 oz", "16.9 oz", "33.8 oz", "6 × 16.9 oz").
 * Never double-converts values already in oz.
 */
export function getCustomerSizeDisplay(sizeOption: SizeOption): string {
  const unit = sizeOption.unit;
  const qty = sizeOption.quantityValue;

  if (unit === 'Pack' || sizeOption.size.toLowerCase() === 'pack') {
    const count = qty && qty > 0 ? qty : 6;
    if (sizeOption.packBottleQuantity && sizeOption.packBottleUnit) {
      const bottleOz = convertToOzNumber(sizeOption.packBottleQuantity, sizeOption.packBottleUnit);
      return `${count}-Pack (${formatOzValue(bottleOz)} ea)`;
    }
    const parsed = parseSizeString(sizeOption.size, sizeOption.label);
    if (parsed.packBottleQuantity && parsed.packBottleUnit) {
      const bottleOz = convertToOzNumber(parsed.packBottleQuantity, parsed.packBottleUnit);
      return `${parsed.quantityValue}-Pack (${formatOzValue(bottleOz)} ea)`;
    }
    return `${count}-Pack`;
  }

  if (qty && qty > 0 && unit) {
    return formatOzValue(convertToOzNumber(qty, unit));
  }

  const parsed = parseSizeString(sizeOption.size, sizeOption.label);
  return formatOzValue(convertToOzNumber(parsed.quantityValue, parsed.unit));
}

/**
 * Returns the full customer-facing descriptive label in ounces, converting any legacy L/cl mentions cleanly.
 */
export function getCustomerSizeFullLabel(sizeOption: SizeOption): string {
  const ozShort = getCustomerSizeDisplay(sizeOption);

  if (sizeOption.unit === 'Pack' || sizeOption.size.toLowerCase() === 'pack') {
    const count = sizeOption.quantityValue || 6;
    const bQty = sizeOption.packBottleQuantity || 50;
    const bUnit = sizeOption.packBottleUnit || 'cl';
    const bottleOz = formatOzValue(convertToOzNumber(bQty, bUnit));
    return `${count} × ${bottleOz} Fresh Bottles Variety Pack`;
  }

  // Strip old cl/Litre prefix from custom descriptor if present (e.g. "35cl (12 oz Pocket Sip)" -> "Pocket Sip")
  let descriptor = (sizeOption.label || '').trim();
  const parenMatch = descriptor.match(/\((?:[\d.]+\s*oz\s*)?([^)]+)\)/i);
  if (parenMatch && parenMatch[1]) {
    descriptor = parenMatch[1].trim();
  } else {
    descriptor = convertInlineMeasurementsToOz(descriptor)
      .replace(/^\d+(?:\.\d+)?\s*oz\s*[-–•]?\s*/i, '')
      .trim();
  }

  if (!descriptor || descriptor.toLowerCase() === ozShort.toLowerCase()) {
    return ozShort;
  }

  return `${ozShort} (${descriptor})`;
}

/**
 * Replaces legacy "DelightOil" brand references with "Delightful Juices" across customer-facing text.
 */
export function sanitizeBrandText(text: string): string {
  if (!text) return '';
  let out = text;

  out = out.replace(/signature\s+DelightOil\s+infusion/gi, 'signature Delightful Juices botanical infusion');
  out = out.replace(/signature\s+DelightOil\s+formulation/gi, 'signature Delightful Juices botanical formulation');
  out = out.replace(/signature\s+DelightOil\s+touch/gi, 'signature Delightful Juices botanical touch');
  out = out.replace(/DelightOil\s+Herbal\s+Extract/gi, 'Delightful Juices Herbal Extract');
  out = out.replace(/DelightOil\s+Extract/gi, 'Delightful Juices Botanical Extract');
  out = out.replace(/Our\s+Signature\s+DelightOil/gi, 'Signature Delightful Juices Blend');
  out = out.replace(/Our\s+DelightOil/gi, 'Delightful Juices Blend');
  out = out.replace(/DelightOil/gi, 'Delightful Juices');
  out = out.replace(/\bDelightful Juice\b(?!s)/g, 'Delightful Juices');

  return out;
}

/**
 * Converts inline text mentions of cl / L / Litre (such as "50cl bottles" or "35cl, 50cl, or 1 Litre" or "DelightOil")
 * for customer-facing display so legacy database strings also display accurate ounces and Delightful Juices branding.
 */
export function sanitizeBrandAndUnitsText(text: string): string {
  if (!text) return '';
  return convertInlineMeasurementsToOz(sanitizeBrandText(text));
}

/**
 * Converts inline metric volume expressions like "35cl", "50 cl", "1 Litre", "1.5 litres", "1L" into accurate US fl oz.
 */
export function convertInlineMeasurementsToOz(text: string): string {
  if (!text) return '';

  // Handle patterns like "35cl (12 oz ...)" first so we don't produce "11.8 oz (12 oz ...)"
  let result = text.replace(
    /\b(\d+(?:\.\d+)?)\s*cl\s*\(\s*\d+(?:\.\d+)?\s*oz([^)]*)\)/gi,
    (_m, numStr, rest) => {
      const oz = formatOzValue(convertToOzNumber(parseFloat(numStr), 'cl'));
      const cleanRest = (rest || '').trim();
      return cleanRest ? `${oz} (${cleanRest})` : oz;
    }
  );

  // Convert centilitres: e.g. 10cl, 25 cl, 30cl, 33cl, 35cl, 50cl
  result = result.replace(/\b(\d+(?:\.\d+)?)\s*cl\b/gi, (_match, numStr) => {
    const val = parseFloat(numStr);
    return formatOzValue(convertToOzNumber(val, 'cl'));
  });

  // Convert litres: e.g. 0.5 L, 1 L, 1.5 litres, 1 Litre, 1L
  result = result.replace(
    /\b(\d+(?:\.\d+)?)\s*(?:litres?|liters?|L)\b/g,
    (_match, numStr) => {
      const val = parseFloat(numStr);
      return formatOzValue(convertToOzNumber(val, 'L'));
    }
  );

  return result;
}

/**
 * Formats an order or catering bottle size code (e.g. '35cl', '50cl', '1L') for customer-facing display in oz.
 */
export function formatBottleCodeToOz(code: string): string {
  if (!code) return '';
  if (code.toLowerCase() === 'pack') return '6-Pack (16.9 oz ea)';
  const parsed = parseSizeString(code);
  return formatOzValue(convertToOzNumber(parsed.quantityValue, parsed.unit));
}
