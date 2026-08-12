/**
 * One-shot exporter: turns the calculator definitions currently hardcoded in
 * `utils/copy.ts` into the two artefacts needed to move them into Sheets —
 *
 *   public/data/calculators.example.json  the committed fallback, used when the
 *                                         sheet tabs do not exist yet and in
 *                                         dev without credentials
 *   scripts/calculators-import.tsv        paste-ready rows for the `calculators`
 *                                         and `calc_questions` tabs
 *
 * Run with `npx tsx scripts/export-calculators.ts`. Re-runnable, but pointless
 * after the sheet becomes the source of truth — at that point copy.ts no longer
 * holds the questions and this script has nothing to read. Kept in the repo as
 * the record of how the migration was done.
 */
import { writeFileSync } from 'node:fs'
import { calculator } from '../utils/copy'
import { CALC_TYPES, isAnswerKey, isAnswerValue } from '../utils/calc-schema'

const calculators = CALC_TYPES.map(id => {
  const config = calculator.configs[id]
  const stepKeys = config.stepKeys as readonly string[]

  const questions = config.steps.map((step, i) => {
    const answerKey = stepKeys[i]
    if (!isAnswerKey(answerKey)) throw new Error(`unknown answerKey "${answerKey}" in ${id}`)
    for (const option of step.options) {
      if (!isAnswerValue(answerKey, option.value)) {
        throw new Error(`unknown value "${option.value}" for ${answerKey} in ${id}`)
      }
    }
    return {
      order:     i + 1,
      answerKey,
      question:  step.question,
      options:   step.options.map(o => ({ label: o.label, value: o.value })),
    }
  })

  return {
    id,
    icon:        config.icon,
    title:       config.title,
    description: config.description,
    questions,
  }
})

writeFileSync('public/data/calculators.example.json', JSON.stringify(calculators, null, 2) + '\n')

// ── TSV for the sheet ───────────────────────────────────────────────────────
const lines: string[] = []
lines.push('### TAB: calculators  (id, icon, title, description, active)')
for (const c of calculators) {
  lines.push([c.id, c.icon, c.title, c.description, 'TRUE'].join('\t'))
}
lines.push('')
lines.push('### TAB: calc_questions  (calcId, order, answerKey, question, options)')
lines.push('## options encoding: Label|value;Label|value   — VALUES MUST NOT BE EDITED,')
lines.push('## they are what the recommendation engine branches on. Labels are free text.')
for (const c of calculators) {
  for (const q of c.questions) {
    const options = q.options.map(o => `${o.label}|${o.value}`).join(';')
    lines.push([c.id, String(q.order), q.answerKey, q.question, options].join('\t'))
  }
}
writeFileSync('scripts/calculators-import.tsv', lines.join('\n') + '\n')

const total = calculators.reduce((n, c) => n + c.questions.length, 0)
console.log(`exported ${calculators.length} calculators, ${total} questions`)
console.log('  → public/data/calculators.example.json')
console.log('  → scripts/calculators-import.tsv')
