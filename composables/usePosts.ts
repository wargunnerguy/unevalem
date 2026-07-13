import type { Post } from '~/types'
import { interestTags, affinityScore, dailyRotationJitter, dayOfYear } from '~/utils/affinity'

const MYTH_RE = /^MÜÜT:\s*/i

function transformPost(p: Post): Post {
  if (MYTH_RE.test(p.title)) {
    return { ...p, title: p.title.replace(MYTH_RE, '').trim(), isMyth: true }
  }
  return { ...p, isMyth: false }
}

export function usePosts() {
  const { data, pending, error } = useFetch<Post[]>('/api/posts', {
    default: () => [] as Post[],
  })

  const posts = computed(() => (data.value ?? []).map(transformPost))

  return { posts, pending, error }
}

export function usePost(slug: string) {
  const { posts, pending, error } = usePosts()
  const post = computed(() => posts.value.find(p => p.slug === slug) ?? null)
  return { post, pending, error }
}

export function useFeaturedPosts(limit = 5) {
  const { posts } = usePosts()
  const { reads } = useReadHistory()
  const { mergedAnswers } = useCalcSession()
  const { lastQuiz } = useQuizHistory()

  // A fresh seed per page load so equally-ranked posts visibly reshuffle each
  // visit — the "feels alive" effect. Generated in onMounted (not at setup) so
  // it's genuinely random on the client and never differs from SSR mid-render.
  const seed = ref(dayOfYear())
  onMounted(() => { seed.value = dayOfYear() + Math.floor(Math.random() * 1000) })

  // Personalized ordering. Relevance (affinity to the visitor's calc/quiz
  // results) dominates; a featured boost keeps flagship posts up for cold
  // visitors; an unread bonus avoids re-surfacing read posts; a sub-1 jitter
  // breaks ties using the per-load seed. See utils/affinity.ts.
  return computed(() => {
    const interest = interestTags(mergedAnswers.value, lastQuiz.value)

    return [...posts.value]
      .map(post => ({
        post,
        score:
          affinityScore(post, interest) +
          (post.isFeatured ? 2 : 0) +
          ((reads.value[post.slug] ?? 0) === 0 ? 1 : 0) +
          dailyRotationJitter(post.id, seed.value),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.post)
  })
}

export function useFilteredPosts(category: Ref<string>) {
  const { posts } = usePosts()
  return computed(() =>
    category.value === 'all'
      ? posts.value
      : posts.value.filter(p => p.category === category.value),
  )
}
