/**
 * avatars.ts — Centralized Avatar System for Veritas
 * Manages preset avatars from Assets, deterministic colorful gradient generation for initials,
 * and avatar state parsing (preset image, custom upload, colorful initials, or neutral person icon).
 */

export interface SuggestedAvatar {
  id: string
  label: string
  src: string
}

export const SUGGESTED_AVATARS: SuggestedAvatar[] = [
  { id: 'avatar-01', label: 'Math Wizard', src: '/avatars/avatar-01.webp' },
  { id: 'avatar-02', label: 'Curious Thinker', src: '/avatars/avatar-02.jpg' },
  { id: 'avatar-03', label: 'Cosmic Explorer', src: '/avatars/avatar-03.jpg' },
  { id: 'avatar-04', label: '3D Creator', src: '/avatars/avatar-04.avif' },
  { id: 'avatar-05', label: 'Scholar Star', src: '/avatars/avatar-05.jpg' },
  { id: 'avatar-06', label: 'Anime Prodigy', src: '/avatars/avatar-06.jpg' },
  { id: 'avatar-07', label: 'Discovery Guide', src: '/avatars/avatar-07.jpg' },
  { id: 'avatar-08', label: 'Problem Solver', src: '/avatars/avatar-08.jpg' },
  { id: 'avatar-09', label: 'Bright Mind', src: '/avatars/avatar-09.jpg' },
  { id: 'avatar-10', label: 'Astronaut', src: '/avatars/avatar-10.jpg' },
  { id: 'avatar-11', label: 'Puzzle Master', src: '/avatars/avatar-11.jpg' },
  { id: 'avatar-12', label: 'Brainstormer', src: '/avatars/avatar-12.jpg' },
  { id: 'avatar-13', label: 'Logic Hero', src: '/avatars/avatar-13.jpg' },
  { id: 'avatar-14', label: 'Deep Thinker', src: '/avatars/avatar-14.jpg' },
  { id: 'avatar-15', label: 'Creative Spark', src: '/avatars/avatar-15.jpg' },
  { id: 'avatar-16', label: 'Galaxy Learner', src: '/avatars/avatar-16.jpg' },
]

/**
 * Curated list of vibrant gradients for initials fallback.
 * Every name gets a deterministic, distinct, eye-catching colorway.
 */
export const COLORFUL_GRADIENTS = [
  { bg: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', text: '#FFFFFF', shadow: 'rgba(99, 102, 241, 0.4)' },
  { bg: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', text: '#FFFFFF', shadow: 'rgba(236, 72, 153, 0.4)' },
  { bg: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', text: '#FFFFFF', shadow: 'rgba(6, 182, 212, 0.4)' },
  { bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', text: '#FFFFFF', shadow: 'rgba(16, 185, 129, 0.4)' },
  { bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', text: '#FFFFFF', shadow: 'rgba(245, 158, 11, 0.4)' },
  { bg: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)', text: '#FFFFFF', shadow: 'rgba(244, 63, 94, 0.4)' },
  { bg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', text: '#FFFFFF', shadow: 'rgba(139, 92, 246, 0.4)' },
  { bg: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', text: '#FFFFFF', shadow: 'rgba(20, 184, 166, 0.4)' },
]

/**
 * Return a deterministic colorful gradient configuration from a name or seed.
 */
export function getColorfulGradient(name = 'User') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % COLORFUL_GRADIENTS.length
  return COLORFUL_GRADIENTS[index]
}

/**
 * Extract first character initial from name or role.
 */
export function getInitial(name?: string, role?: string): string {
  if (name && name.trim().length > 0) {
    const clean = name.trim()
    return clean.charAt(0).toUpperCase()
  }
  return role === 'parent' ? 'P' : 'S'
}

/**
 * Returns true if avatar is set to the neutral person silhouette icon ('person' or 'deleted').
 * This state cannot be deleted further, only replaced with a new photo.
 */
export function isPersonSilhouette(avatar?: string | null): boolean {
  return avatar === 'person' || avatar === 'deleted'
}

/**
 * Returns true if avatar value is an image path, data URL, or external URL.
 */
export function isImageAvatar(avatar?: string | null): boolean {
  if (!avatar) return false
  if (isPersonSilhouette(avatar)) return false
  if (avatar === 'initials') return false
  return (
    avatar.startsWith('/') ||
    avatar.startsWith('data:image/') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://')
  )
}
