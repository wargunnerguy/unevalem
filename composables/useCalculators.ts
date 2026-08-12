import type { CalcConfig, CalcType } from '~/types'
import { CALC_TYPES } from '~/utils/calc-schema'

/**
 * The three calculators, as edited in the `calculators` / `calc_questions`
 * sheet tabs and baked into calculators.json at build time.
 *
 * Everything downstream keys off `answerKey`: the funnel's prefill, the skip
 * logic, the response-sheet columns and the recommendation engine. Those values
 * are validated during the build (see fetch-content.ts), so by the time the
 * browser sees this data it is already known-good — there is no runtime
 * validation here on purpose, because there is nothing useful a page could do
 * about a bad calculator except render it wrong.
 */
export function useCalculators() {
  const { data, pending, error } = useFetch<CalcConfig[]>('/api/calculators', {
    default: () => [] as CalcConfig[],
  })

  const calculators = computed(() => data.value ?? [])

  /** Ordered pillow → blanket → mattress, whatever order the sheet returns. */
  const ordered = computed(() =>
    CALC_TYPES
      .map(type => calculators.value.find(c => c.id === type))
      .filter((c): c is CalcConfig => !!c),
  )

  function configFor(type: CalcType): CalcConfig | null {
    return calculators.value.find(c => c.id === type) ?? null
  }

  function stepKeysFor(type: CalcType): string[] {
    return configFor(type)?.questions.map(q => q.answerKey) ?? []
  }

  return { calculators, ordered, configFor, stepKeysFor, pending, error }
}
