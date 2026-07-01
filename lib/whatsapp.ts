const MIN_PHONE_DIGITS = 9;

export function isLikelyValidPhone(phone: string | null | undefined): phone is string {
  return (phone ?? '').replace(/\D/g, '').length >= MIN_PHONE_DIGITS;
}

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('60')) return digits;
  if (digits.startsWith('0')) return `60${digits.slice(1)}`;
  return digits;
}

export function buildDefaultMessage(contact: { nama: string; dun?: string; parlimen?: string }): string {
  const kawasan = contact.dun ? `DUN ${contact.dun}` : contact.parlimen || 'kawasan anda';
  return `Salam ${contact.nama},\n\nSaya menghubungi dari pejabat khidmat rakyat ${kawasan}. Sekiranya terdapat sebarang pertanyaan atau keperluan berkaitan pendaftaran pengundi, sila maklumkan kepada kami.\n\nTerima kasih.`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${formatPhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}
