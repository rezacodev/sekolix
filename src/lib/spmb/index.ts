import { createHash } from "crypto";

/**
 * Hash sensitive identifiers (NIK/phone) before storing them.
 */
export function hashIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Mask identifiers for display (first/last characters remain visible).
 */
export function maskIdentifier(value: string) {
  if (value.length <= 6) return value;
  const prefix = value.slice(0, 2);
  const suffix = value.slice(-4);
  return `${prefix}${"*".repeat(value.length - 6)}${suffix}`;
}
