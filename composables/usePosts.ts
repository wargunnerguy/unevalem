import type { Post } from '~/types'

export function usePosts() {
  const { data, pending, error } = useFetch<Post[]>('/api/posts', {
    default: () => [] as Post[],
  })

  const posts = computed(() => data.value ?? [])

  return { posts, pending, error }
}

export function usePost(slug: string) {
  const { posts, pending, error } = usePosts()
  const post = computed(() => posts.value.find(p => p.slug === slug) ?? null)
  return { post, pending, error }
}

export function useFeaturedPosts(limit = 3) {
  const { posts } = usePosts()
  return computed(() => posts.value.filter(p => p.isFeatured).slice(0, limit))
}

export function useFilteredPosts(category: Ref<string>) {
  const { posts } = usePosts()
  return computed(() =>
    category.value === 'all'
      ? posts.value
      : posts.value.filter(p => p.category === category.value),
  )
}
