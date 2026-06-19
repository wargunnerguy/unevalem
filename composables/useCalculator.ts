import type { UserProfile, CalculatorResult, Product } from '~/types'
import { getRecommendations } from '~/utils/calculator'

type AnswerKey = keyof UserProfile

export function useCalculator() {
  const step = useState<number>('calc-step', () => 1)
  const answers = useState<Partial<UserProfile>>('calc-answers', () => ({}))
  const result = useState<CalculatorResult | null>('calc-result', () => null)
  const analyzing = useState<boolean>('calc-analyzing', () => false)

  function selectOption(key: AnswerKey, value: string) {
    answers.value = { ...answers.value, [key]: value as any }
    if (step.value < 10) step.value++
  }

  function submitQuiz(products: Product[]) {
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
    }
    result.value = getRecommendations(profile, products)
    analyzing.value = true

    setTimeout(() => {
      analyzing.value = false
      step.value = 11
    }, 6000)
  }

  function goBack() {
    if (step.value > 1 && step.value <= 10) step.value--
  }

  function reset() {
    step.value = 1
    answers.value = {}
    result.value = null
    analyzing.value = false
  }

  return {
    step,
    answers,
    result,
    analyzing,
    selectOption,
    submitQuiz,
    goBack,
    reset,
  }
}
