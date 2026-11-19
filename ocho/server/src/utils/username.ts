/**
 * Username validation and anti-SARA / anti-racism / anti-profanity moderation engine.
 */

// Banned keywords covering SARA (Suku, Agama, Ras, Antargolongan), racism, slurs, profanity, and impersonation
const BANNED_USERNAME_KEYWORDS = [
  // SARA & Racism / Slurs
  'rasis',
  'sara',
  'negro',
  'nigger',
  'nigga',
  'cina',
  'chindo',
  'sipit',
  'kafir',
  'teroris',
  'komunis',
  'pki',
  'cebong',
  'kadrun',
  'yahudi',
  'zionis',
  'suku_',
  'agama_',

  // Harsh Indonesian profanities & sexually explicit terms
  'kontol',
  'kntl',
  'memek',
  'mmk',
  'ngentot',
  'ngentod',
  'ngtd',
  'pantek',
  'peler',
  'jembut',
  'bangsat',
  'bajingan',
  'lonte',
  'perek',
  'psk',
  'bokep',
  'porno',
  'sange',
  'itil',
  'pepek',
  'titit',
  'toket',
  'tetek',
  'asu',
  'babi',
  'anjing',
  'anjir',
  'kampret',

  // System & Platform Impersonation
  'admin',
  'administrator',
  'ocho',
  'ochomarket',
  'official',
  'moderator',
  'root',
  'system',
  'rektorat',
  'unpad_official',
];

export interface UsernameValidationResult {
  valid: boolean;
  message?: string;
  normalizedUsername?: string;
}

export function validateUsername(rawUsername: string): UsernameValidationResult {
  if (!rawUsername || typeof rawUsername !== 'string') {
    return { valid: false, message: 'Username wajib diisi.' };
  }

  const trimmed = rawUsername.trim().toLowerCase();

  // Length check: 3 to 20 characters
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, message: 'Username harus memiliki panjang antara 3 hingga 20 karakter.' };
  }

  // Format check: alphanumeric, underscore, dot only
  const validPattern = /^[a-z0-9][a-z0-9._]*[a-z0-9]$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      message: 'Username hanya boleh huruf kecil, angka, garis bawah (_), dan titik (.), tidak boleh diawali atau diakhiri tanda baca.',
    };
  }

  // No consecutive dots or underscores
  if (trimmed.includes('..') || trimmed.includes('__') || trimmed.includes('._') || trimmed.includes('_.')) {
    return {
      valid: false,
      message: 'Username tidak boleh mengandung titik atau garis bawah berturut-turut.',
    };
  }

  // Must contain at least one letter
  if (!/[a-z]/.test(trimmed)) {
    return {
      valid: false,
      message: 'Username harus mengandung minimal satu huruf.',
    };
  }

  // Banned keywords & SARA check
  const compact = trimmed.replace(/[._]/g, '');
  for (const banned of BANNED_USERNAME_KEYWORDS) {
    const cleanBanned = banned.replace(/[._]/g, '');
    if (trimmed.includes(banned) || compact.includes(cleanBanned)) {
      return {
        valid: false,
        message: 'Username tidak diizinkan karena mengandung unsur SARA, ujaran kebencian, kata tidak pantas, atau nama sistem.',
      };
    }
  }

  return {
    valid: true,
    normalizedUsername: trimmed,
  };
}
