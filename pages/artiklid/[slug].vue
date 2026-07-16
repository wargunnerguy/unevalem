<script setup lang="ts">
import { marked } from 'marked'
import type { Post } from '~/types'
import { blogPage, blogCategories, common } from '~/utils/copy'

definePageMeta({
  key: (route) => route.fullPath,
})

const route = useRoute()
const slug = route.params.slug as string

const { posts, pending } = usePosts()

const post = computed<Post | null>(() => posts.value.find(p => p.slug === slug) ?? null)

// Mark the article read so it isn't re-surfaced to the top of homepage picks,
// and record an anonymous view so popular posts rank higher site-wide.
const { markRead } = useReadHistory()
const { trackPostView } = useAnalytics()
watch(post, (p) => {
  if (p && import.meta.client) {
    markRead(p.slug)
    trackPostView(p.slug)
  }
}, { immediate: true })

const relatedPosts = computed<Post[]>(() => {
  if (!post.value) return []
  return posts.value
    .filter(p => p.category === post.value!.category && p.slug !== slug)
    .slice(0, 3)
})

// Redirect to listing if post not found after data loads
watchEffect(() => {
  if (!pending.value && !post.value) {
    navigateTo('/artiklid')
  }
})

useHead(
  computed(() => ({
    title: post.value ? `${post.value.title} | Unevalem` : 'Unevalem',
    meta: post.value
      ? [
          { name: 'description', content: post.value.excerpt },
          { property: 'og:title', content: post.value.title },
          { property: 'og:description', content: post.value.excerpt },
          ...(post.value.coverImage
            ? [{ property: 'og:image', content: post.value.coverImage }]
            : []),
        ]
      : [],
  })),
)

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked.parse(post.value.content) as string
})

const categoryLabel = computed(() => {
  if (!post.value) return ''
  return blogCategories[post.value.category as keyof typeof blogCategories] ?? post.value.category
})

// Share
const { siteUrl } = useRuntimeConfig().public
const postUrl = computed(() => `${siteUrl}/artiklid/${slug}`)

const copied = ref(false)
async function copyLink() {
  if (!import.meta.client) return
  try {
    await navigator.clipboard.writeText(postUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // clipboard API unavailable — silently ignore
  }
}

const facebookShareUrl = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl.value)}`,
)
</script>

<template>
  <div class="min-h-screen bg-moonlight">

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <p class="text-muted">{{ common.loading }}</p>
    </div>

    <template v-else-if="post">

      <!-- Article -->
      <article class="max-w-2xl mx-auto px-4 py-10">

        <!-- Back link -->
        <NuxtLink
          to="/artiklid"
          class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-midnight transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
        >
          ← {{ blogPage.heading }}
        </NuxtLink>

        <!-- Cover image -->
        <div v-if="post.coverImage" class="mb-8 rounded-2xl overflow-hidden">
          <img
            :src="post.coverImage"
            :alt="post.title"
            class="w-full h-56 sm:h-72 object-cover"
          />
        </div>

        <!-- Meta row -->
        <div class="flex items-center gap-3 flex-wrap mb-4">
          <span
            class="text-xs px-2.5 py-0.5 rounded-full border border-lavender/40 bg-foam text-midnight font-medium"
          >
            {{ categoryLabel }}
          </span>
          <span v-if="post.isMyth" class="text-xs px-2.5 py-0.5 rounded-full bg-midnight text-gold font-bold uppercase tracking-wide">
            ✕ MÜÜT
          </span>
          <span class="text-sm text-muted">
            {{ blogPage.readingTime(post.readingTimeMin) }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="font-heading text-3xl md:text-4xl text-midnight leading-snug mb-8">
          {{ post.title }}
        </h1>

        <!-- Content -->
        <div
          class="prose max-w-none"
          v-html="renderedContent"
        />

        <!-- Dive deeper: the article's own sources. PostCard renders this too,
             but on this page PostCard only covers the related posts below. -->
        <div v-if="post.diveDeeper?.length" class="mt-10 pt-6 border-t border-lavender/20">
          <p class="text-sm font-semibold text-midnight mb-3">{{ blogPage.diveDeeperHeading }}</p>
          <ul class="space-y-1.5">
            <li v-for="link in post.diveDeeper" :key="link.url">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-midnight hover:text-gold underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              >
                {{ link.title }} →
              </a>
            </li>
          </ul>
        </div>

        <!-- Share -->
        <div class="mt-10 pt-6 border-t border-lavender/20">
          <p class="text-sm font-semibold text-midnight mb-3">{{ blogPage.share.heading }}</p>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-lavender/30 bg-foam text-midnight hover:border-lavender hover:bg-moonlight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
              :aria-label="blogPage.share.copyLink"
              @click="copyLink"
            >
              {{ copied ? common.linkCopied : blogPage.share.copyLink }}
            </button>
            <a
              :href="facebookShareUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#1877F2] text-white hover:bg-[#1464d0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]"
            >
              {{ blogPage.share.facebook }}
            </a>
          </div>
        </div>

      </article>

      <!-- Related posts -->
      <section v-if="relatedPosts.length" class="max-w-4xl mx-auto px-4 pb-14">
        <h2 class="font-heading text-2xl md:text-3xl text-midnight mb-6">
          {{ blogPage.relatedHeading }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PostCard
            v-for="rPost in relatedPosts"
            :key="rPost.id"
            :post="rPost"
          />
        </div>
      </section>

    </template>

  </div>
</template>
