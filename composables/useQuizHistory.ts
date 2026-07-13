import type { QuizSignal } from '~/utils/affinity'

// Persists the visitor's most recent quiz result so it can personalize which
// posts surface (see useFeaturedPosts). Same cookie style as useReadHistory /
// useCalcSession. The quiz page otherwise discards the result on restart.
export function useQuizHistory() {
  const lastQuiz = useCookie<QuizSignal | null>('uva-quiz', {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: 'lax',
    default: () => null,
  })

  function saveQuizResult(id: string, key: string) {
    lastQuiz.value = { id, key }
  }

  return { lastQuiz, saveQuizResult }
}
