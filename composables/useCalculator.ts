import type { UserProfile, CalculatorResult, Product, CalcType } from '~/types'
import { getRecommendations } from '~/utils/calculator'

type AnswerKey = keyof UserProfile

export function useCalculator() {
  const step     = useState<number>('calc-step',      () => 1)
  const answers  = useState<Partial<UserProfile>>('calc-answers', () => ({}))
  const result   = useState<CalculatorResult | null>('calc-result', () => null)
  const analyzing = useState<boolean>('calc-analyzing', () => false)

  function selectOption(key: AnswerKey, value: string) {
    answers.value = { ...answers.value, [key]: value as never }
    if (step.value < 5) step.value++
  }

  function submitQuiz(products: Product[], calcType: CalcType) {
    const profile: UserProfile = {
      position:      answers.value.position      ?? 'combo',
      bodyType:      answers.value.bodyType      ?? 'medium',
      neckPain:      answers.value.neckPain      ?? 'never',
      sweating:      answers.value.sweating      ?? 'rarely',
      temp:          answers.value.temp          ?? 'normal',
      blanketWeight: answers.value.blanketWeight ?? 'medium',
      partner:       answers.value.partner       ?? 'solo',
      allergies:     answers.value.allergies     ?? 'none',
      pillowAge:     answers.value.pillowAge     ?? 'new',
      complaint:     answers.value.complaint     ?? 'none',
      backPain:      answers.value.backPain,
      mattressAge:   answers.value.mattressAge,
    }
    result.value = getRecommendations(profile, products, calcType)
    analyzing.value = true
  }

  function finishAnalysis() {
    analyzing.value = false
    step.value = 6
  }

  function goBack() {
    if (step.value > 1 && step.value <= 5) step.value--
  }

  function reset(prefill?: Partial<UserProfile>) {
    step.value = 1
    answers.value = prefill ?? {}
    result.value = null
    analyzing.value = false
  }

  return { step, answers, result, analyzing, selectOption, submitQuiz, finishAnalysis, goBack, reset }
}
