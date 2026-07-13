import type { Post, UserProfile } from '~/types'

// ─────────────────────────────────────────────────────────────────────────────
// Post affinity: relevance scoring that surfaces the posts most useful to a
// visitor based on their calculator answers and last quiz result. Pure — no Vue
// deps (mirrors utils/calculator.ts) so it stays testable and framework-free.
//
// The maps below translate calc/quiz *signals* into interest keywords that are
// matched against each post's `tags[]`. Post tags stay author-editable in the
// Google Sheet; only these maps need touching when the calc/quiz content
// evolves. Unknown signals contribute nothing (graceful degradation).
// ─────────────────────────────────────────────────────────────────────────────

// Keyed by `${field}:${value}` from stored UserProfile answers.
const CALC_SIGNAL_TAGS: Record<string, string[]> = {
  // Temperature / sweating → thermoregulation, bamboo bedding
  'temp:hot':            ['termoregulatsioon', 'bambus', 'higistamine'],
  'sweating:often':      ['termoregulatsioon', 'bambus', 'higistamine'],
  'sweating:sometimes':  ['termoregulatsioon', 'bambus'],
  'roomTemp:warm':       ['termoregulatsioon', 'bambus'],
  'problemSeason:summer':['termoregulatsioon', 'bambus'],

  // Neck / pillow / position
  'neckPain:often':      ['kael', 'padi', 'magamisasend'],
  'neckPain:sometimes':  ['kael', 'padi'],
  'position:side':       ['magamisasend', 'padi'],
  'position:back':       ['magamisasend', 'padi'],
  'position:stomach':    ['magamisasend', 'padi'],
  'position:combo':      ['magamisasend'],

  // Back / mattress
  'backPain:often':      ['selg', 'madrats', 'magamisasend'],
  'backPain:sometimes':  ['selg', 'madrats'],

  // Sleep complaints / routines
  'complaint:cant-sleep':    ['uinumine', 'rituaal', 'nõuanded'],
  'complaint:wake-at-night': ['unetsüklid', 'ärkamine'],
  'complaint:wake-tired':    ['unetsüklid', 'ärkamine'],

  // Allergies → naturally antimicrobial bamboo
  'allergies:dust-mites': ['bambus', 'allergia'],
  'allergies:synthetic':  ['bambus', 'allergia'],

  // Partner / blanket
  'partner:shared':    ['tekk', 'partner'],
  'partner:separate':  ['tekk', 'partner'],
  'blanketWeight:heavy': ['tekk'],

  // Life stage
  'age:senior':  ['uneaeg'],
  'age:young':   ['uneaeg'],
}

// Keyed by `${quizId}:${resultKey}`. Minimal for now — extend as quizzes are
// reworked to be product-relevant. Unknown keys simply add nothing.
const QUIZ_RESULT_TAGS: Record<string, string[]> = {
  'chronotype:owl':          ['ärkamine', 'unetsüklid', 'rituaal'],
  'chronotype:lark':         ['ärkamine', 'unetsüklid'],
  'chronotype:intermediate': ['unetsüklid'],
}

export interface QuizSignal {
  id: string
  key: string
}

/** Union of interest keywords derived from calc answers + last quiz result. */
export function interestTags(
  answers: Partial<UserProfile>,
  quiz: QuizSignal | null,
): Set<string> {
  const tags = new Set<string>()

  for (const [field, value] of Object.entries(answers)) {
    if (value == null) continue
    for (const tag of CALC_SIGNAL_TAGS[`${field}:${value}`] ?? []) {
      tags.add(tag.toLowerCase())
    }
  }

  if (quiz) {
    for (const tag of QUIZ_RESULT_TAGS[`${quiz.id}:${quiz.key}`] ?? []) {
      tags.add(tag.toLowerCase())
    }
  }

  return tags
}

/** +3 per overlapping post tag; 0 when the visitor has no profile yet. */
export function affinityScore(post: Post, interest: Set<string>): number {
  if (!interest.size) return 0
  let score = 0
  for (const tag of post.tags) {
    if (interest.has(tag.toLowerCase())) score += 3
  }
  return score
}

/** Day-of-year (1–366), the rotation seed — matches the daily-tip formula. */
export function dayOfYear(now: Date = new Date()): number {
  return Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  )
}

/**
 * Deterministic pseudo-random value in [0, 1) from a post id + daily seed.
 * Kept strictly below 1 so it only ever breaks ties between equally-scored
 * posts — never overriding affinity, featured, or unread weighting. The daily
 * seed makes tied posts reshuffle each day so the list never feels frozen.
 */
export function dailyRotationJitter(postId: number, seed: number): number {
  const x = Math.sin((postId + 1) * 12.9898 + seed * 78.233) * 43_758.5453
  return x - Math.floor(x)
}
