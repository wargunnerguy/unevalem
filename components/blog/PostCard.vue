<script setup lang="ts">
import { marked } from 'marked'
import type { Post } from '~/types'
import { blogCategories, blogPage, common } from '~/utils/copy'

const props = defineProps<{ post: Post }>()

const { posts } = usePosts()
const { markRead, isRead } = useReadHistory()
const expanded = ref(false)

const categoryLabel = (cat: Post['category']) =>
  blogCategories[cat as keyof typeof blogCategories] ?? cat

const renderedContent = computed(() =>
  expanded.value ? (marked.parse(props.post.content ?? '') as string) : '',
)

const relatedPosts = computed(() =>
  (posts.value ?? [])
    .filter(p => p.category === props.post.category && p.id !== props.post.id)
    .slice(0, 3),
)

function toggle() {
  if (!expanded.value) markRead(props.post.slug)
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="border-b border-gray-100 py-5">

    <!-- Badges row -->
    <div class="flex items-center gap-2 flex-wrap mb-2">
      <span class="text-xs px-2 py-0.5 rounded-full border border-lavender/40 bg-moonlight text-midnight font-medium">
        {{ categoryLabel(post.category) }}
      </span>
      <span v-if="post.isFeatured" class="text-xs px-2 py-0.5 rounded-full bg-gold text-midnight font-semibold">
        {{ common.popularBadge }}
      </span>
      <span v-if="post.isMyth" class="text-xs px-2.5 py-0.5 rounded-full bg-midnight text-gold font-bold uppercase tracking-wide">
        ✕ MÜÜT
      </span>
      <span class="text-xs text-muted ml-auto">{{ blogPage.readingTime(post.readingTimeMin) }}</span>
    </div>

    <!-- Title -->
    <h2 class="font-heading text-xl leading-snug mb-2" :class="isRead(post.slug) ? 'text-midnight/60' : 'text-midnight'">{{ post.title }}</h2>

    <!-- Excerpt (always visible) -->
    <p class="text-sm text-midnight leading-relaxed">{{ post.excerpt }}</p>

    <!-- Expand toggle — pill button so the action is easy to spot -->
    <button
      v-if="!expanded"
      type="button"
      class="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-midnight text-gold text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      @click="toggle"
    >
      {{ common.readMore }} →
    </button>

    <!-- Expanded section: max-height CSS transition -->
    <div
      class="overflow-hidden transition-[max-height] duration-500 ease-in-out"
      :style="expanded ? 'max-height: 5000px' : 'max-height: 0'"
    >
      <!-- Full content -->
      <div
        class="prose prose-sm max-w-none mt-4 text-midnight"
        v-html="renderedContent"
      />

      <!-- Dive deeper links -->
      <div v-if="post.diveDeeper?.length" class="mt-6 pt-4 border-t border-gray-100">
        <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{{ blogPage.diveDeeperHeading }}</p>
        <ul class="space-y-1.5">
          <li v-for="link in post.diveDeeper" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-midnight hover:text-gold underline underline-offset-2 transition-colors"
            >
              {{ blogPage.sourceLabel }}: {{ link.title }} →
            </a>
          </li>
        </ul>
      </div>

      <!-- Related posts -->
      <div v-if="relatedPosts.length" class="mt-6 pt-4 border-t border-gray-100">
        <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{{ blogPage.relatedHeading }}</p>
        <ul class="space-y-2">
          <li v-for="p in relatedPosts" :key="p.id">
            <NuxtLink
              :to="`/artiklid/${p.slug}`"
              class="text-sm text-midnight hover:text-gold transition-colors leading-snug"
            >
              {{ p.title }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Collapse -->
      <button
        type="button"
        class="mt-5 text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
        @click="toggle"
      >
        Sulge ↑
      </button>
    </div>

  </article>
</template>
