/**
 * The calculator's answer vocabulary, at runtime.
 *
 * Question text and option labels live in the `calc_questions` sheet tab so
 * they can be edited without a developer. The KEYS and VALUES cannot: they are
 * what `utils/calculator.ts` branches on, what `useCalcSession` matches when it
 * prefills a later calculator, and what names the columns in each
 * `<calcType>_responses` tab. A typo in one of those in the sheet would not
 * throw anywhere - the engine would simply stop recognising the answer, quietly
 * scoring everyone as though they had not answered, and the response column
 * would fill with a value nothing reads.
 *
 * So this file is the contract. `scripts/fetch-content.ts` validates every
 * sheet row against it and fails the build on a mismatch, which turns that
 * silent breakage into a loud one before it can ship.
 *
 * The union types in `types/index.ts` are erased at runtime and cannot do this
 * job. When a type there changes, change it here too - the paired test in
 * `scripts/check-influence.ts` will catch a drift between this map and the
 * options the calculators actually offer.
 */
import type { UserProfile } from '~/types'

export type AnswerKey = keyof UserProfile

export const ANSWER_VALUES: Record<AnswerKey, readonly string[]> = {
  position:        ['side', 'back', 'stomach', 'combo'],
  bodyType:        ['slim', 'medium', 'broad'],
  neckPain:        ['often', 'sometimes', 'never'],
  sweating:        ['often', 'sometimes', 'rarely'],
  temp:            ['cold', 'normal', 'hot'],
  blanketWeight:   ['light', 'medium', 'heavy'],
  partner:         ['solo', 'shared', 'separate'],
  allergies:       ['dust-mites', 'synthetic', 'other', 'none'],
  pillowAge:       ['new', '1-3y', '3y+'],
  complaint:       ['cant-sleep', 'wake-at-night', 'wake-tired', 'none'],
  backPain:        ['often', 'sometimes', 'never'],
  mattressAge:     ['new', '1-3y', '3-5y', '5y+'],
  age:             ['young', 'adult', 'middle', 'senior'],
  sleepQuality:    ['poor', 'fair', 'good'],
  pillowCount:     ['one', 'two-plus'],
  currentMattress: ['spring', 'foam', 'hybrid', 'unknown'],
  roomTemp:        ['cool', 'moderate', 'warm'],
  problemSeason:   ['winter', 'summer', 'year-round'],
} as const

export const ANSWER_KEYS = Object.keys(ANSWER_VALUES) as AnswerKey[]

export function isAnswerKey(key: string): key is AnswerKey {
  return Object.prototype.hasOwnProperty.call(ANSWER_VALUES, key)
}

export function isAnswerValue(key: AnswerKey, value: string): boolean {
  return ANSWER_VALUES[key].includes(value)
}

/** The three calculators, in the order the funnel offers them. */
export const CALC_TYPES = ['pillow', 'blanket', 'mattress'] as const
