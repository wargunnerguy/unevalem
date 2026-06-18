<script setup lang="ts">
import type { Post } from '~/types'
import { blogCategories, blogPage } from '~/utils/copy'

defineProps<{
  posts: Post[]
}>()

const selectedCategory = ref<string>('all')

const categories = [
  { key: 'all',      label: blogCategories.all },
  { key: 'teadus',   label: blogCategories.teadus },
  { key: 'nõuanded', label: blogCategories.nõuanded },
  { key: 'tooted',   label: blogCategories.tooted },
  { key: 'uneaeg',   label: blogCategories.uneaeg },
] as const
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

    <!-- Grid -->
    <div
      v-if="posts.filter(p => selectedCategory === 'all' || p.category === selectedCategory).length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <PostCard
        v-for="post in posts.filter(p => selectedCategory === 'all' || p.category === selectedCategory)"
        :key="post.id"
        :post="post"
      />
    </div>
    <p v-else class="text-center py-14 text-muted">
      {{ blogPage.emptyCategory }}
    </p>
  </div>
</template>
