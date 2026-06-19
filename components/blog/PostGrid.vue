<script setup lang="ts">
import type { Post } from '~/types'
import { blogCategories, blogPage } from '~/utils/copy'

const props = defineProps<{
  posts: Post[]
}>()

const PAGE_SIZE = 10

const selectedCategory = ref<string>('all')
const visibleCount = ref(PAGE_SIZE)
const sentinel = ref<HTMLElement | null>(null)

const categories = [
  { key: 'all',      label: blogCategories.all },
  { key: 'teadus',   label: blogCategories.teadus },
  { key: 'nõuanded', label: blogCategories.nõuanded },
  { key: 'tooted',   label: blogCategories.tooted },
  { key: 'uneaeg',   label: blogCategories.uneaeg },
] as const

watch(selectedCategory, () => { visibleCount.value = PAGE_SIZE })

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'all') return props.posts
  return props.posts.filter(p => p.category === selectedCategory.value)
})

const visiblePosts = computed(() => filteredPosts.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < filteredPosts.value.length)

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry.isIntersecting && hasMore.value) {
    visibleCount.value += PAGE_SIZE
  }
})
</script>

<template>
  <div>
    <!-- Category tabs -->
    <div
      role="tablist"
      aria-label="Filtreeri kategooria järgi"
      class="flex gap-2 overflow-x-auto pb-2 mb-7 scrollbar-none"
    >
      <button
        v-for="cat in categories"
        :key="cat.key"
        type="button"
        role="tab"
        :aria-selected="selectedCategory === cat.key"
        class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
        :class="
          selectedCategory === cat.key
            ? 'bg-midnight text-foam'
            : 'border border-lavender/30 bg-foam text-muted hover:border-lavender/60 hover:text-midnight'
        "
        @click="selectedCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Vertical list -->
    <div v-if="filteredPosts.length">
      <PostCard
        v-for="post in visiblePosts"
        :key="post.id"
        :post="post"
      />

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-4 mt-4" aria-hidden="true" />

      <p v-if="hasMore" class="py-4 text-center text-sm text-muted" aria-live="polite">
        Laen rohkem...
      </p>
    </div>

    <p v-else class="text-center py-14 text-muted">
      {{ blogPage.emptyCategory }}
    </p>
  </div>
</template>
