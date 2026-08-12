import type { UserProfile, CalculatorResult, Product, CalcType } from '~/types'
import { getRecommendations } from '~/utils/calculator'

type AnswerKey = keyof UserProfile

export function useCalculator() {
  const step     = useState<number>('calc-step',      () => 1)
  const answers  = useState<Partial<UserProfile>>('calc-answers', () => ({}))
  const result   = useState<CalculatorResult | null>('calc-result', () => null)
  const analyzing = useState<boolean>('calc-analyzing', () => false)

  /**
   * Steps whose answer arrived pre-filled — from an earlier calculator in the
   * same session, or from a campaign page. They are held in `answers` but never
   * shown: re-asking someone their sleeping position because they moved from
   * the pillow flow to the mattress flow reads as the site not remembering.
   *
   * Snapshotted at reset() rather than derived from `answers`, which grows as
   * the visitor answers — without the snapshot every answered step would
   * immediately become skippable and the flow would jump to the end.
   */
  const prefilledKeys = useState<string[]>('calc-prefilled', () => [])

  const isSkipped = (key: string | undefined) => !!key && prefilledKeys.value.includes(key)

  /** First step the visitor still has to answer; totalSteps + 1 if none. */
  function firstUnanswered(stepKeys: readonly string[]): number {
    for (let i = 0; i < stepKeys.length; i++) {
      if (!isSkipped(stepKeys[i])) return i + 1
    }
    return stepKeys.length + 1
  }

  function nextStepFrom(from: number, stepKeys: readonly string[]): number {
    let next = from + 1
    while (next <= stepKeys.length && isSkipped(stepKeys[next - 1])) next++
    return next
  }

  function prevStepFrom(from: number, stepKeys: readonly string[]): number {
    let prev = from - 1
    while (prev >= 1 && isSkipped(stepKeys[prev - 1])) prev--
    return prev
  }

  function selectOption(key: AnswerKey, value: string, stepKeys: readonly string[]) {
    answers.value = { ...answers.value, [key]: value as never }
    const next = nextStepFrom(step.value, stepKeys)
    if (next <= stepKeys.length) step.value = next
  }

  function buildProfile(a: Partial<UserProfile>): UserProfile {
    return {
      position:        a.position        ?? 'combo',
      bodyType:        a.bodyType        ?? 'medium',
      neckPain:        a.neckPain        ?? 'never',
      sweating:        a.sweating        ?? 'rarely',
      temp:            a.temp            ?? 'normal',
      blanketWeight:   a.blanketWeight   ?? 'medium',
      partner:         a.partner         ?? 'solo',
      allergies:       a.allergies       ?? 'none',
      pillowAge:       a.pillowAge       ?? 'new',
      complaint:       a.complaint       ?? 'none',
      backPain:        a.backPain,
      mattressAge:     a.mattressAge,
      age:             a.age,
      sleepQuality:    a.sleepQuality,
      pillowCount:     a.pillowCount,
      currentMattress: a.currentMattress,
      roomTemp:        a.roomTemp,
      problemSeason:   a.problemSeason,
    }
  }

  function submitQuiz(products: Product[], calcType: CalcType) {
    result.value = getRecommendations(buildProfile(answers.value), products, calcType)
    analyzing.value = true
  }

  // Rebuild a finished result screen from a stored profile (e.g. after a page
  // refresh) without replaying the analyzing animation or re-submitting analytics.
  function restore(
    savedAnswers: Partial<UserProfile>,
    products: Product[],
    calcType: CalcType,
    totalSteps: number,
  ) {
    answers.value = { ...savedAnswers }
    result.value = getRecommendations(buildProfile(savedAnswers), products, calcType)
    analyzing.value = false
    prefilledKeys.value = []
    step.value = totalSteps + 1
  }

  function finishAnalysis(totalSteps: number) {
    analyzing.value = false
    step.value = totalSteps + 1
  }

  function goBack(stepKeys: readonly string[]) {
    if (step.value < 1 || step.value > stepKeys.length) return
    const prev = prevStepFrom(step.value, stepKeys)
    if (prev >= 1) step.value = prev
  }

  /**
   * `stepKeys` is what makes skipping possible — without it (or with no
   * prefill) this behaves exactly as before and starts at step 1.
   */
  function reset(prefill?: Partial<UserProfile>, stepKeys?: readonly string[]) {
    const filled = prefill ?? {}
    answers.value = { ...filled }
    prefilledKeys.value = stepKeys
      ? stepKeys.filter(key => (filled as Record<string, unknown>)[key] !== undefined)
      : []
    step.value = stepKeys ? firstUnanswered(stepKeys) : 1
    result.value = null
    analyzing.value = false
  }

  return {
    step, answers, result, analyzing, prefilledKeys, isSkipped,
    selectOption, submitQuiz, restore, finishAnalysis, goBack, reset,
    firstUnanswered, nextStepFrom,
  }
}
