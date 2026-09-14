// emailValidation.ts — Format validation, common typo detection & friendly error mapping

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface EmailValidationResult {
  valid: boolean
  reason?: string
}

export function validateEmailFormat(raw: string): EmailValidationResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { valid: false, reason: 'Please enter your email address.' }
  }
  if (trimmed.length > 254) {
    return { valid: false, reason: 'That email looks too long.' }
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "That doesn't look like a valid email — check for typos." }
  }
  return { valid: true }
}

export const COMMON_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'yahho.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'iclloud.com': 'icloud.com',
  'iclud.com': 'icloud.com',
}

/**
 * Checks if the email domain matches a known typo of a popular email provider
 * and returns the suggested corrected email, or null if no typo detected.
 */
export function suggestCorrection(email: string): string | null {
  const trimmed = email.trim()
  const parts = trimmed.split('@')
  if (parts.length !== 2) return null

  const domain = parts[1]?.toLowerCase()
  if (domain && COMMON_TYPOS[domain]) {
    return `${parts[0]}@${COMMON_TYPOS[domain]}`
  }
  return null
}

/**
 * Maps Supabase / GoTrue auth errors or raw network errors into user-friendly guidance.
 */
export function friendlyAuthError(rawError: string): string {
  if (!rawError) return 'Something went wrong sending your code. Please try again.'
  const lower = rawError.toLowerCase()

  if (lower.includes('invalid') && lower.includes('email')) {
    return 'That email address looks invalid — please double-check it.'
  }
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('security purposes') || lower.includes('429')) {
    return 'Too many attempts — please wait a few minutes before trying again.'
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection') || lower.includes('offline')) {
    return 'Connection issue — please check your internet and try again.'
  }
  if (lower.includes('token has expired') || lower.includes('otp expired') || lower.includes('invalid token')) {
    return 'Verification code is invalid or has expired. Please check the latest code in your inbox or Spam folder, or request a fresh code.'
  }
  return 'Something went wrong sending your code. Please try again.'
}
