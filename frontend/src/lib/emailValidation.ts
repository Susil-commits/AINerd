// emailValidation.ts — Format validation, typo detection, field-specific guards & friendly error mapping

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export type EmailValidationResult = ValidationResult
export type NameValidationResult = ValidationResult

/**
 * Validates that an input is strictly a valid email address and NOT a phone number, name, or random text.
 */
export function validateEmailFormat(raw: string): EmailValidationResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { valid: false, reason: 'Please enter your email address.' }
  }

  // Reject internal spaces
  if (/\s/.test(trimmed)) {
    return { valid: false, reason: 'Email addresses cannot contain spaces.' }
  }

  // 1. Explicit Phone Number Guard: Check if input looks like a phone number
  const phonePattern = /^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}$/
  const digitsOnly = trimmed.replace(/\D/g, '')
  if (phonePattern.test(trimmed) || (digitsOnly.length >= 7 && !trimmed.includes('@'))) {
    return {
      valid: false,
      reason: 'It looks like you entered a phone number. Veritas uses email sign-in — please enter an email address (e.g. name@example.com).',
    }
  }

  // 2. Explicit Plain Name Guard: Check if input looks like a person's name without @
  if (!trimmed.includes('@')) {
    if (/^[\p{L}\s'’.-]+$/u.test(trimmed)) {
      return {
        valid: false,
        reason: 'It looks like you entered a name. Please enter a valid email address with an "@" symbol (e.g. alex@example.com).',
      }
    }
    return {
      valid: false,
      reason: 'Missing "@" symbol — please enter your complete email address.',
    }
  }

  // 3. Domain and structure checks
  const parts = trimmed.split('@')
  if (parts.length > 2) {
    return { valid: false, reason: 'An email address can only contain one "@" symbol.' }
  }

  const [localPart, domainPart] = parts
  if (!localPart) {
    return { valid: false, reason: 'Missing username before the "@" symbol.' }
  }

  if (!domainPart) {
    return { valid: false, reason: 'Incomplete email — please enter your domain after "@" (e.g. name@gmail.com).' }
  }

  if (!domainPart.includes('.')) {
    return { valid: false, reason: `Missing domain extension — did you mean @${domainPart}.com?` }
  }

  if (domainPart.endsWith('.')) {
    return { valid: false, reason: 'Please complete the domain extension (e.g. .com, .org, .edu).' }
  }

  // Check top-level domain (TLD)
  const tld = domainPart.split('.').pop()
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return {
      valid: false,
      reason: `Invalid domain extension ".${tld || ''}". Please use a valid extension like .com, .edu, or .org.`,
    }
  }

  if (trimmed.length > 254) {
    return { valid: false, reason: 'That email looks too long.' }
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "That doesn't look like a valid email format — please check for typos." }
  }

  return { valid: true }
}

/**
 * Validates that the Full Name field contains a real person's name and NOT an email, phone number, or symbols.
 */
export function validateNameFormat(raw: string): NameValidationResult {
  const trimmed = raw.trim()
  // Name is optional during signup, so empty is valid
  if (!trimmed) {
    return { valid: true }
  }

  // 1. Guard against email in name field
  if (trimmed.includes('@')) {
    return { valid: false, reason: 'Please enter your real name, not an email address.' }
  }

  // 2. Guard against phone numbers or digits in name field
  if (/\d/.test(trimmed)) {
    return { valid: false, reason: 'Names cannot contain numbers or digits. Please use letters only.' }
  }

  // 3. Guard against excessive symbols or special characters
  // Allow Unicode letters (Latin, accented, etc.), spaces, hyphens, and apostrophes
  const validNameRegex = /^[\p{L}\s'’-]+$/u
  if (!validNameRegex.test(trimmed)) {
    return { valid: false, reason: 'Names should only contain letters, spaces, hyphens, or apostrophes.' }
  }

  if (trimmed.length < 2) {
    return { valid: false, reason: 'Name must be at least 2 characters long.' }
  }

  if (trimmed.length > 50) {
    return { valid: false, reason: 'Name is too long (maximum 50 characters).' }
  }

  return { valid: true }
}

/**
 * Sanitizes name input in real-time as user types (strips digits and illegal symbols).
 */
export function sanitizeNameInput(raw: string): string {
  // Allow letters, spaces, hyphens, and apostrophes
  return raw.replace(/[^\p{L}\s'’-]/gu, '').slice(0, 50)
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
  if (!rawError) return 'Something went wrong. Please check your Spam / Junk folder for the code or try again.'
  const lower = rawError.toLowerCase()

  if (lower.includes('invalid') && lower.includes('email')) {
    return 'That email address looks invalid — please double-check it.'
  }
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('security purposes') || lower.includes('429')) {
    return 'Too many attempts — please wait a few minutes before trying again, and check your Spam / Junk folder for earlier codes.'
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('connection') || lower.includes('offline')) {
    return 'Connection issue — please check your internet and try again.'
  }
  if (
    lower.includes('signups not allowed') ||
    lower.includes('signup not allowed') ||
    lower.includes('user not found') ||
    lower.includes('no user') ||
    lower.includes('not registered')
  ) {
    return 'No account found with this email. Please switch to "Create Free Account" to register first!'
  }
  if (
    lower.includes('token') ||
    lower.includes('otp') ||
    lower.includes('grant') ||
    lower.includes('expired') ||
    lower.includes('incorrect') ||
    lower.includes('wrong code') ||
    (lower.includes('invalid') && !lower.includes('email'))
  ) {
    return 'Incorrect or expired verification code. Please check the latest code in your Spam / Junk folder or inbox, or click "Resend" for a fresh code.'
  }
  return `Error: ${rawError}. If a code was sent, please remember to check your Spam / Junk folder!`
}
