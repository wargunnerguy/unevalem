import type { UserProfile, CalculatorResult, Product, CalcType } from '~/types'
import { getRecommendations } from '~/utils/calculator'

type AnswerKey = keyof UserProfile

export function useCalculator() {
  const step     = useState<number>('calc-step',      () => 1)
  const answers  = useState<Partial<UserProfile>>('calc-answers', () => ({}))
  const result   = useState<CalculatorResult | null>('calc-result', () => null)
  const analyzing = useState<boolean>('calc-analyzing', () => false)

  function selectOption(key: AnswerKey, value: string, totalSteps: number) {
    answers.value = { ...answers.value, [key]: value as never }
    if (step.value < totalSteps) step.value++
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
    step.value = totalSteps + 1
  }

  function finishAnalysis(totalSteps: number) {
    analyzing.value = false
    step.value = totalSteps + 1
  }

  function goBack(totalSteps: number) {
    if (step.value > 1 && step.value <= totalSteps) step.value--
  }

  function reset(prefill?: Partial<UserProfile>) {
    step.value = 1
    answers.value = prefill ?? {}
    result.value = null
    analyzing.value = false
  }

  return { step, answers, result, analyzing, selectOption, submitQuiz, restore, finishAnalysis, goBack, reset }
}
