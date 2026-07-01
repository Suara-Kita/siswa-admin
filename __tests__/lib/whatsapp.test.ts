import { describe, expect, it } from 'vitest';
import { buildDefaultMessage, buildWhatsAppUrl, formatPhoneForWhatsApp, isLikelyValidPhone } from '@/lib/whatsapp';

describe('formatPhoneForWhatsApp', () => {
  it('replaces a leading 0 with the 60 country code', () => {
    expect(formatPhoneForWhatsApp('0177466905')).toBe('60177466905');
  });

  it('leaves an already-prefixed 60 number untouched', () => {
    expect(formatPhoneForWhatsApp('60177466905')).toBe('60177466905');
  });

  it('does not guess a country code for a number with no recognizable MY prefix', () => {
    // Avoids corrupting non-Malaysian numbers (e.g. Singapore's 65-xxxxxxx)
    // by blindly prepending 60 when the prefix is ambiguous.
    expect(formatPhoneForWhatsApp('6591234567')).toBe('6591234567');
  });

  it('strips non-digit separators before formatting', () => {
    expect(formatPhoneForWhatsApp('017-746 6905')).toBe('60177466905');
  });

  it('strips a leading + from an international-format number', () => {
    expect(formatPhoneForWhatsApp('+60177466905')).toBe('60177466905');
  });

  it('returns an empty string for an empty input', () => {
    expect(formatPhoneForWhatsApp('')).toBe('');
  });
});

describe('isLikelyValidPhone', () => {
  it('accepts a normal Malaysian mobile number', () => {
    expect(isLikelyValidPhone('0177466905')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isLikelyValidPhone('')).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    expect(isLikelyValidPhone('   ')).toBe(false);
  });

  it('rejects short placeholder text like "-" or "N/A"', () => {
    expect(isLikelyValidPhone('-')).toBe(false);
    expect(isLikelyValidPhone('N/A')).toBe(false);
  });

  it('does not throw and rejects null/undefined (the DB returns null for absent alt_number)', () => {
    expect(isLikelyValidPhone(null)).toBe(false);
    expect(isLikelyValidPhone(undefined)).toBe(false);
  });
});

describe('buildDefaultMessage', () => {
  it('mentions the DUN when one is present', () => {
    const msg = buildDefaultMessage({ nama: 'Ali', dun: 'Pemanis', parlimen: 'Sekijang' });
    expect(msg).toContain('Salam Ali,');
    expect(msg).toContain('DUN Pemanis');
    expect(msg).not.toContain('Sekijang');
  });

  it('falls back to parlimen when dun is missing', () => {
    const msg = buildDefaultMessage({ nama: 'Ali', parlimen: 'Sekijang' });
    expect(msg).toContain('Sekijang');
    expect(msg).not.toContain('DUN');
  });

  it('falls back to a generic phrase when both dun and parlimen are missing', () => {
    const msg = buildDefaultMessage({ nama: 'Ali' });
    expect(msg).toContain('kawasan anda');
  });

  it('falls back to a generic phrase when dun is an empty string', () => {
    const msg = buildDefaultMessage({ nama: 'Ali', dun: '', parlimen: '' });
    expect(msg).toContain('kawasan anda');
  });
});

describe('buildWhatsAppUrl', () => {
  it('builds a wa.me URL with the formatted phone and encoded text', () => {
    const url = buildWhatsAppUrl('0177466905', 'Salam, ujian.');
    expect(url).toBe('https://wa.me/60177466905?text=Salam%2C%20ujian.');
  });

  it('encodes newlines and special characters in the message', () => {
    const url = buildWhatsAppUrl('0177466905', 'Line one\nLine two & more');
    const [, query] = url.split('?text=');
    expect(decodeURIComponent(query)).toBe('Line one\nLine two & more');
  });
});
