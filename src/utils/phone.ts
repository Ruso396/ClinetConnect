/** Remove everything except digits: spaces, brackets, dashes, plus, dots. */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/** Canonical phone value used for comparisons and database uniqueness. */
export function normalizePhone(phone: string): string {
  const digits = cleanPhoneNumber(phone)
  if (!digits) return ''

  if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) return `91${digits.slice(1)}`
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) return digits

  return digits
}

/** WhatsApp deep link using the canonical phone value. */
export function waLink(phone: string): string {
  return `https://wa.me/${normalizePhone(phone)}`
}

export function telLink(phone: string): string {
  return `tel:${normalizePhone(phone)}`
}

/** Google Maps search link built from the customer address. */
export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}