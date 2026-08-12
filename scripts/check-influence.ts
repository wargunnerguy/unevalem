/**
 * Two checks over the calculator, both run from `npx tsx scripts/check-influence.ts`.
 *
 * 1. INFLUENCE — the rule from CLAUDE.md: every calculator step must visibly
 *    influence the result. For each question it holds every other answer fixed,
 *    walks that question's options, and counts how many distinct results come
 *    out, where "result" is the score, the profile summary, the tip list and
 *    the recommended product id together. A question that yields 1 distinct
 *    result for N options is dead — the visitor answered it and nothing moved.
 *
 * 2. DEAD SHEET COLUMNS — which columns in each `<calcType>_responses` tab can
 *    never receive a value, because that calculator does not ask the question.
 *    This is the list `deleteEmptyCalcColumns()` in apps-script.gs will remove.
 *
 * Exits non-zero if a dead question appears, so it can be wired into CI later.
 */
import { readFileSync } from 'node:fs'
import { getRecommendations } from '../utils/calculator'
import { calculator } from '../utils/copy'

type Any = Record<string, string>

const CALC_TYPES = ['pillow', 'blanket', 'mattress'] as const
const products = JSON.parse(readFileSync('public/data/products.json', 'utf8'))

// Same defaults useCalculator.buildProfile applies to an unanswered field.
const BASE: Any = {
  position: 'combo', bodyType: 'medium', neckPain: 'never', sweating: 'rarely',
  temp: 'normal', blanketWeight: 'medium', partner: 'solo', allergies: 'none',
  pillowAge: 'new', complaint: 'none',
}

function fingerprint(profile: Any, calcType: typeof CALC_TYPES[number]): string {
  const r = getRecommendations(profile as never, products, calcType)
  return JSON.stringify([r.currentScore, r.profileSummary, r.personalTips, r.recommendations[0]?.id ?? ''])
}

// ── 1. Influence ────────────────────────────────────────────────────────────
console.log('QUESTION INFLUENCE')
let dead = 0
for (const calcType of CALC_TYPES) {
  const config = calculator.configs[calcType]
  const keys = config.stepKeys as readonly string[]
  console.log(`\n  ${calcType}`)

  keys.forEach((key, i) => {
    const options = config.steps[i].options.map(o => o.value)
    // Fill every other question with its first option so the baseline is a
    // fully answered profile, not one leaning on defaults.
    const others: Any = { ...BASE }
    keys.forEach((k, j) => { if (k !== key) others[k] = config.steps[j].options[0].value })

    const seen = new Set(options.map(v => fingerprint({ ...others, [key]: v }, calcType)))
    const flag = seen.size === 1 ? 'DEAD   ' : seen.size < options.length ? 'partial' : 'ok     '
    if (seen.size === 1) dead++
    console.log(`    ${flag} ${key.padEnd(16)} ${options.length} options -> ${seen.size} distinct results`)
  })
}

// ── 2. Dead sheet columns ───────────────────────────────────────────────────
// A response tab receives a column per payload key. Now that the client sends
// only its own stepKeys, every other answer field is a column that can never
// be filled in that tab.
const ALL_ANSWER_KEYS = [...new Set(CALC_TYPES.flatMap(t => calculator.configs[t].stepKeys as readonly string[]))]

console.log('\n\nDEAD COLUMNS PER RESPONSE TAB')
console.log('  (delete these in the sheet — only after the new client code is live)')
for (const calcType of CALC_TYPES) {
  const asked = calculator.configs[calcType].stepKeys as readonly string[]
  const never = ALL_ANSWER_KEYS.filter(k => !asked.includes(k)).sort()
  console.log(`\n  ${calcType}_responses  (${never.length} columns)`)
  console.log(`    ${never.join(', ')}`)
}

console.log(dead === 0
  ? '\n\nEvery question changes the result at least once.'
  : `\n\n${dead} question(s) change nothing.`)
process.exit(dead === 0 ? 0 : 1)
