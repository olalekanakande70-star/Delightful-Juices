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
 * Formats an ounce number cleanly (e.g. 12 -> "12oz", 16 -> "16oz", 18 -> "18oz").
 * Standardised strictly without spaces between the number and "oz".
 */
export function formatOzValue(oz: number): string {
  if (!Number.isFinite(oz) || oz <= 0) return '12oz';
  // Standardise legacy bottle sizes to 12oz, 16oz, 18oz
  if (Math.abs(oz - 16.9) < 0.2 || oz === 16 || Math.abs(oz - 17) < 0.2) return '16oz';
  if (Math.abs(oz - 33.8) < 0.2 || oz === 18 || Math.abs(oz - 34) < 0.5) return '18oz';
  if (Math.abs(oz - 11.8) < 0.2 || oz === 12) return '12oz';
  const rounded = Math.round(oz * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${formatted}oz`;
}

/**
 * Parses a legacy size string (e.g., "35cl", "50cl", "1L", "1.5L", "12 oz", "16.9 oz", "33.8 oz", "Pack")
 * into structured { quantityValue, unit } mapped to standardised 12oz, 16oz, 18oz.
 */
export function parseSizeString(sizeStr: string, labelStr?: string): {
  quantityValue: number;
  unit: MeasurementUnit;
  packBottleQuantity?: number;
  packBottleUnit?: MeasurementUnit;
} {
  const clean = (sizeStr || '').trim();

  if (clean.toLowerCase() === 'pack' || clean.toLowerCase().includes('pack')) {
    const packMatch = (labelStr || clean).match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cl|l|ml|oz)/i);
    if (packMatch) {
      const count = parseFloat(packMatch[1]);
      let bQty = parseFloat(packMatch[2]);
      const rawUnit = packMatch[3].toLowerCase();
      if (rawUnit === 'cl' && Math.abs(bQty - 50) < 5) bQty = 16;
      else if (rawUnit === 'l' && Math.abs(bQty - 1) < 0.2) bQty = 18;
      else if (Math.abs(bQty - 16.9) < 0.5) bQty = 16;
      return {
        quantityValue: count,
        unit: 'Pack',
        packBottleQuantity: bQty,
        packBottleUnit: 'oz',
      };
    }
    return {
      quantityValue: 6,
      unit: 'Pack',
      packBottleQuantity: 16,
      packBottleUnit: 'oz',
    };
  }

  // Match e.g. "35cl", "50 cl", "1L", "1.5 L", "16.9oz", "16.9 oz", "12oz", "16oz", "18oz", "500ml"
  const match = clean.match(/^(\d+(?:\.\d+)?)\s*(cl|l|litre|litres|liter|liters|ml|oz|fl\s*oz)$/i);
  if (match) {
    const qty = parseFloat(match[1]);
    const rawU = match[2].toLowerCase();
    if (rawU === 'cl') {
      if (Math.abs(qty - 35) <= 3) return { quantityValue: 12, unit: 'oz' };
      if (Math.abs(qty - 50) <= 5) return { quantityValue: 16, unit: 'oz' };
      return { quantityValue: 12, unit: 'oz' };
    }
    if (rawU.startsWith('l')) {
      if (Math.abs(qty - 1) <= 0.2) return { quantityValue: 18, unit: 'oz' };
      return { quantityValue: 18, unit: 'oz' };
    }
    if (rawU === 'ml') {
      if (qty <= 360) return { quantityValue: 12, unit: 'oz' };
      if (qty <= 550) return { quantityValue: 16, unit: 'oz' };
      return { quantityValue: 18, unit: 'oz' };
    }
    if (Math.abs(qty - 16.9) < 0.5 || qty === 16) return { quantityValue: 16, unit: 'oz' };
    if (Math.abs(qty - 33.8) < 0.5 || qty === 18) return { quantityValue: 18, unit: 'oz' };
    if (Math.abs(qty - 11.8) < 0.5 || qty === 12) return { quantityValue: 12, unit: 'oz' };
    return { quantityValue: qty, unit: 'oz' };
  }

  // Fallback check on labelStr if sizeStr wasn't standard
  if (labelStr) {
    const lblMatch = labelStr.match(/(\d+(?:\.\d+)?)\s*(cl|l|litre|litres|ml|oz)/i);
    if (lblMatch) {
      const qty = parseFloat(lblMatch[1]);
      const rawU = lblMatch[2].toLowerCase();
      if (rawU === 'cl') {
        if (Math.abs(qty - 35) <= 3) return { quantityValue: 12, unit: 'oz' };
        if (Math.abs(qty - 50) <= 5) return { quantityValue: 16, unit: 'oz' };
      }
      if (rawU.startsWith('l')) return { quantityValue: 18, unit: 'oz' };
      if (Math.abs(qty - 16.9) < 0.5 || qty === 16) return { quantityValue: 16, unit: 'oz' };
      if (Math.abs(qty - 33.8) < 0.5 || qty === 18) return { quantityValue: 18, unit: 'oz' };
      if (Math.abs(qty - 11.8) < 0.5 || qty === 12) return { quantityValue: 12, unit: 'oz' };
      return { quantityValue: qty, unit: 'oz' };
    }
  }

  return { quantityValue: 12, unit: 'oz' };
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

  // Replace "Fragrant" with "Natural Botanicals" (case-preserving patterns)
  out = out.replace(/\bFragrant\b/g, 'Natural Botanicals');
  out = out.replace(/\bfragrant\b/g, 'natural botanicals');
  out = out.replace(/\bFRAGRANT\b/g, 'NATURAL BOTANICALS');

  // Remove "Cold-Pressed", "Cold pressed", "Cold-pressing", etc.
  out = out.replace(/\bFresh\s+Cold-Pressed\b/gi, 'Fresh');
  out = out.replace(/\b100%\s+Natural\s+Cold-Pressed\b/gi, '100% Natural Botanicals');
  out = out.replace(/\bPure\s+Cold-Pressing\b/gi, 'Pure Botanical Extraction');
  out = out.replace(/\bCold-Pressed\s+/gi, '');
  out = out.replace(/\bCold-pressed\s+/gi, '');
  out = out.replace(/\bcold-pressed\s+/gi, '');
  out = out.replace(/\bCold\s+Pressed\s+/gi, '');
  out = out.replace(/\bcold\s+pressed\s+/gi, '');
  out = out.replace(/\s+Cold-Pressed\b/gi, '');
  out = out.replace(/\s+cold-pressed\b/gi, '');
  out = out.replace(/\bCold-Pressed\b/gi, '');
  out = out.replace(/\bcold-pressed\b/gi, '');

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

  // Handle patterns like "35cl (12 oz ...)" first so we don't produce "12oz (12oz ...)"
  let result = text.replace(
    /\b(\d+(?:\.\d+)?)\s*cl\s*\(\s*\d+(?:\.\d+)?\s*oz([^)]*)\)/gi,
    (_m, numStr, rest) => {
      const oz = formatOzValue(convertToOzNumber(parseFloat(numStr), 'cl'));
      const cleanRest = (rest || '').trim();
      return cleanRest ? `${oz} (${cleanRest})` : oz;
    }
  );

  // Standardise existing oz mentions with spaces or decimals to 12oz, 16oz, 18oz
  result = result.replace(/\b11\.8\s*oz\b/gi, '12oz');
  result = result.replace(/\b11\.8oz\b/gi, '12oz');
  result = result.replace(/\b16\.9\s*oz\b/gi, '16oz');
  result = result.replace(/\b16\.9oz\b/gi, '16oz');
  result = result.replace(/\b33\.8\s*oz\b/gi, '18oz');
  result = result.replace(/\b33\.8oz\b/gi, '18oz');
  result = result.replace(/\b12\s*oz\b/gi, '12oz');
  result = result.replace(/\b16\s*oz\b/gi, '16oz');
  result = result.replace(/\b18\s*oz\b/gi, '18oz');

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
 * Formats an order or catering bottle size code (e.g. '35cl', '50cl', '1L', '12oz', '16oz', '18oz') for customer-facing display in oz.
 */
export function formatBottleCodeToOz(code: string): string {
  if (!code) return '';
  if (code.toLowerCase() === 'pack') return '6-Pack (16oz ea)';
  const parsed = parseSizeString(code);
  return formatOzValue(convertToOzNumber(parsed.quantityValue, parsed.unit));
}
