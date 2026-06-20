import type { Quiz } from '~/types'

export function useQuizzes() {
  const { data, pending, error } = useFetch<Quiz[]>('/api/quizzes', {
    default: () => [] as Quiz[],
  })

  const quizzes = computed(() => data.value ?? [])

  return { quizzes, pending, error }
}

export function useQuiz(id?: string) {
  const { quizzes, pending, error } = useQuizzes()
  const quiz = computed<Quiz | null>(() => {
    const all = quizzes.value
    if (!all.length) return null
    return (id ? all.find(q => q.id === id) : all[0]) ?? null
  })
  return { quiz, pending, error }
}
