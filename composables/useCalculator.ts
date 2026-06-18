import type { UserProfile, CalculatorResult, SleepIssue, PillowLoft } from '~/types'
import { getRecommendations } from '~/utils/calculator'

function inferLoft(position?: UserProfile['position']): PillowLoft {
  if (position === 'stomach') return 'low'
  if (position === 'back') return 'medium'
  if (position === 'side') return 'high'
  return 'medium'
}

type AnswerKey = Exclude<keyof UserProfile, 'issues'>

export function useCalculator() {
  const step = useState<number>('calc-step', () => 1)
  const answers = useState<Partial<UserProfile>>('calc-answers', () => ({}))
  const result = useState<CalculatorResult | null>('calc-result', () => null)

  function selectOption(key: AnswerKey, value: string) {
    if (key === 'loft' && value === 'unknown') {
      // Infer loft from position; don't store 'unknown' (not a valid PillowLoft)
      const inferred = inferLoft(answers.value.position)
      answers.value = { ...answers.value, loft: inferred }
    } else {
      answers.value = { ...answers.value, [key]: value as any }
    }
    if (step.value < 5) step.value++
  }

  function toggleIssue(value: SleepIssue | 'none') {
    if (value === 'none') {
      answers.value = { ...answers.value, issues: [] }
      return
    }
    const current = answers.value.issues ?? []
    const idx = current.indexOf(value)
    answers.value = {
      ...answers.value,
      issues: idx >= 0 ? current.filter(i => i !== value) : [...current, value],
    }
  }

  function submitIssues() {
    const profile: UserProfile = {
      position: answers.value.position ?? 'combo',
      temp: answers.value.temp ?? 'normal',
      loft: answers.value.loft ?? inferLoft(answers.value.position),
      partner: answers.value.partner ?? 'solo',
      issues: answers.value.issues ?? [],
    }
    result.value = getRecommendations(profile)
    step.value = 6
  }

  function goBack() {
    if (step.value > 1) step.value--
  }

  function reset() {
    step.value = 1
    answers.value = {}
    result.value = null
  }

  return {
    step,
    answers,
    result,
    selectOption,
    toggleIssue,
    submitIssues,
    goBack,
    reset,
  }
}
