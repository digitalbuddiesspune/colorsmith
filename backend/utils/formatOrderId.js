/**
 * Matches frontend `utility/formatedOrderId.js` — display ID shown on orders pages.
 * Last 6 digits (from numeric chars only) with # prefix, e.g. CS2602121234 → #121234
 */
export function formatOrderIdForDisplay(orderId) {
  if (!orderId) return '#N/A';
  const idString = String(orderId);
  const digitsOnly = idString.replace(/\D/g, '');
  if (digitsOnly.length === 0) return '#N/A';
  const lastSix =
    digitsOnly.length > 6 ? digitsOnly.slice(-6) : digitsOnly.padStart(6, '0');
  return `#${lastSix}`;
}
