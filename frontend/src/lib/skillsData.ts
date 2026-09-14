/**
 * Centralized Skill Metadata Registry for Veritas
 * Maps Common Core standard IDs to human-readable information shown to students and parents.
 */

export type MasteryTier = 'needs-work' | 'developing' | 'proficient' | 'mastered'

export interface SkillMeta {
  /** Raw Common Core standard ID */
  id: string
  /** Full human-readable topic title */
  title: string
  /** Short title used on radar chart axes */
  shortTitle: string
  /** Grade level string e.g. "Grade 3" */
  grade: string
  /** Domain e.g. "Operations & Algebraic Thinking" */
  domain: string
  /** Short domain abbreviation for badges e.g. "OA" */
  domainAbbr: string
  /** One-sentence educational summary */
  description: string
  /** CSS color token variable for this domain */
  domainColor: string
}

const SKILLS_REGISTRY: Record<string, SkillMeta> = {
  '3.OA.A.1': {
    id: '3.OA.A.1',
    title: 'Understanding Multiplication',
    shortTitle: 'Multiply',
    grade: 'Grade 3',
    domain: 'Operations & Algebraic Thinking',
    domainAbbr: 'OA',
    description: 'Interpreting products of whole numbers as equal groups, arrays, and repeated addition.',
    domainColor: 'var(--violet)',
  },
  '3.OA.A.2': {
    id: '3.OA.A.2',
    title: 'Understanding Division',
    shortTitle: 'Divide',
    grade: 'Grade 3',
    domain: 'Operations & Algebraic Thinking',
    domainAbbr: 'OA',
    description: 'Interpreting whole-number quotients by partitioning a set equally or finding missing factors.',
    domainColor: 'var(--violet)',
  },
  '3.OA.D.8': {
    id: '3.OA.D.8',
    title: 'Two-Step Word Problems',
    shortTitle: '2-Step WP',
    grade: 'Grade 3',
    domain: 'Operations & Algebraic Thinking',
    domainAbbr: 'OA',
    description: 'Solving two-step word problems using all four operations, and assessing reasonableness of answers.',
    domainColor: 'var(--violet)',
  },
  '4.NF.A.1': {
    id: '4.NF.A.1',
    title: 'Equivalent Fractions',
    shortTitle: 'Equiv. Frac',
    grade: 'Grade 4',
    domain: 'Number & Fractions',
    domainAbbr: 'NF',
    description: 'Explaining why fractions are equivalent using visual models and generating equivalent forms.',
    domainColor: 'var(--amber)',
  },
  '4.NF.B.3': {
    id: '4.NF.B.3',
    title: 'Adding & Subtracting Fractions',
    shortTitle: 'Add Frac',
    grade: 'Grade 4',
    domain: 'Number & Fractions',
    domainAbbr: 'NF',
    description: 'Adding and subtracting fractions and mixed numbers with the same denominator.',
    domainColor: 'var(--amber)',
  },
  '4.NF.B.4': {
    id: '4.NF.B.4',
    title: 'Fractions × Whole Numbers',
    shortTitle: 'Frac × Whole',
    grade: 'Grade 4',
    domain: 'Number & Fractions',
    domainAbbr: 'NF',
    description: 'Multiplying a fraction by a whole number using visual models and repeated addition.',
    domainColor: 'var(--amber)',
  },
  '5.NF.B.7': {
    id: '5.NF.B.7',
    title: 'Dividing Fractions',
    shortTitle: 'Div. Frac',
    grade: 'Grade 5',
    domain: 'Number & Fractions',
    domainAbbr: 'NF',
    description: 'Dividing unit fractions by whole numbers and whole numbers by unit fractions.',
    domainColor: 'var(--amber)',
  },
  '6.EE.A.2': {
    id: '6.EE.A.2',
    title: 'Algebraic Expressions',
    shortTitle: 'Expressions',
    grade: 'Grade 6',
    domain: 'Expressions & Equations',
    domainAbbr: 'EE',
    description: 'Writing, reading, and evaluating algebraic expressions with variables and real-world contexts.',
    domainColor: 'var(--emerald)',
  },
  '6.EE.B.7': {
    id: '6.EE.B.7',
    title: 'Solving One-Step Equations',
    shortTitle: '1-Step Eq',
    grade: 'Grade 6',
    domain: 'Expressions & Equations',
    domainAbbr: 'EE',
    description: 'Solving real-world problems by writing and solving one-step equations of the form px = q.',
    domainColor: 'var(--emerald)',
  },
  '7.EE.B.4': {
    id: '7.EE.B.4',
    title: 'Multi-Step Equations',
    shortTitle: 'Multi-Step Eq',
    grade: 'Grade 7',
    domain: 'Expressions & Equations',
    domainAbbr: 'EE',
    description: 'Solving multi-step real-life problems with positive and negative rational numbers in equations.',
    domainColor: 'var(--emerald)',
  },
}

/** Resolve skill metadata from a standard ID, falling back gracefully */
export function getSkillMeta(skillId: string): SkillMeta {
  if (SKILLS_REGISTRY[skillId]) return SKILLS_REGISTRY[skillId]
  // Graceful fallback for unknown skills
  return {
    id: skillId,
    title: skillId.replace(/_/g, ' '),
    shortTitle: skillId,
    grade: 'Unknown',
    domain: 'Math',
    domainAbbr: '?',
    description: 'Practice this math skill to improve your mastery.',
    domainColor: 'var(--text-muted)',
  }
}

/** Classify a mastery probability (0–1) into a named tier */
export function getMasteryTier(prob: number): MasteryTier {
  if (prob >= 0.85) return 'mastered'
  if (prob >= 0.70) return 'proficient'
  if (prob >= 0.40) return 'developing'
  return 'needs-work'
}

export interface MasteryTierInfo {
  tier: MasteryTier
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
}

export function getMasteryTierInfo(prob: number): MasteryTierInfo {
  const tier = getMasteryTier(prob)
  switch (tier) {
    case 'mastered':
      return {
        tier,
        label: 'Mastered',
        color: '#34D399',
        bgColor: 'rgba(52, 211, 153, 0.12)',
        borderColor: 'rgba(52, 211, 153, 0.35)',
        icon: '⭐',
      }
    case 'proficient':
      return {
        tier,
        label: 'Proficient',
        color: '#A78BFA',
        bgColor: 'rgba(167, 139, 250, 0.12)',
        borderColor: 'rgba(167, 139, 250, 0.35)',
        icon: '✓',
      }
    case 'developing':
      return {
        tier,
        label: 'Developing',
        color: '#F5A623',
        bgColor: 'rgba(245, 166, 35, 0.12)',
        borderColor: 'rgba(245, 166, 35, 0.35)',
        icon: '↗',
      }
    case 'needs-work':
    default:
      return {
        tier,
        label: 'Needs Practice',
        color: '#F87171',
        bgColor: 'rgba(248, 113, 113, 0.12)',
        borderColor: 'rgba(248, 113, 113, 0.35)',
        icon: '!',
      }
  }
}

export function getBarGradient(tier: MasteryTier): string {
  switch (tier) {
    case 'mastered':   return 'linear-gradient(90deg, #10B981, #34D399)'
    case 'proficient': return 'linear-gradient(90deg, #7C5DFA, #A78BFA)'
    case 'developing': return 'linear-gradient(90deg, #D97706, #F5A623)'
    case 'needs-work':
    default:           return 'linear-gradient(90deg, #DC2626, #F87171)'
  }
}

export { SKILLS_REGISTRY }
