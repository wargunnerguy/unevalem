import type { Post } from '~/types'

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
  const { reads, visits, sortUnreadFirst } = useReadHistory()

  return computed(() => {
    const all = posts.value
    const featured = all.filter(p => p.isFeatured)
    const others = all.filter(p => !p.isFeatured)

    // After 3 visits where all featured posts have already been read, blend in others
    const v = visits.value ?? 0
    const allFeaturedRead = featured.length > 0 && featured.every(p => (reads.value[p.slug] ?? 0) > 0)
    const pool = (v >= 3 && allFeaturedRead)
      ? sortUnreadFirst([...featured, ...others])
      : [...sortUnreadFirst(featured), ...others]

    return pool.slice(0, limit)
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
