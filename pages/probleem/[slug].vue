<script setup lang="ts">
import { marked } from 'marked'
import { painPage, common, blogPage } from '~/utils/copy'

definePageMeta({
  // Keyed on the slug only. A fullPath key would change with every utm_*
  // query, discarding the prerendered payload and forcing a fetch to
  // /api/pains — which does not exist on a static host. Since every ad click
  // arrives with a query string, that would have broken 100% of paid traffic.
  key: route => route.params.slug as string,
})

const route = useRoute()
const slug = route.params.slug as string

const { siteUrl } = useRuntimeConfig().public
const { pain, pending, pains } = usePain(slug)
const { posts } = usePosts()

// Which calculator (if any) to embed, and what to pre-answer in it.
const calcType = computed(() => (pain.value ? parseCalcType(pain.value.ctaType) : null))
const prefill = computed(() => (pain.value ? parsePrefill(pain.value.prefill) : {}))

const renderedBody = computed(() =>
  pain.value?.bodyMd ? (marked.parse(pain.value.bodyMd) as string) : '',
)

const relatedPosts = computed(() => {
  const slugs = pain.value?.relatedSlugs ?? []
  if (!slugs.length) return []
  return slugs
    .map(s => posts.value.find(p => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p)
})

// Only redirect when the list actually loaded and this slug is not in it (a
// deactivated campaign row). An empty list means the fetch failed — bouncing
// paid traffic in that case throws away the click that was paid for.
watchEffect(() => {
  if (!pending.value && pains.value.length > 0 && !pain.value) navigateTo('/')
})

useHead(
  computed(() => ({
    title: pain.value?.metaTitle || pain.value?.headline || 'Unevalem',
    meta: pain.value
      ? [
          { name: 'description', content: pain.value.metaDescription },
          { property: 'og:title', content: pain.value.metaTitle || pain.value.headline },
          { property: 'og:description', content: pain.value.metaDescription },
          { property: 'og:url', content: `${siteUrl}/probleem/${pain.value.slug}` },
          { property: 'og:type', content: 'article' },
          ...(pain.value.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
          ...(pain.value.ogImage
            ? [
                { key: 'og-image', property: 'og:image', content: pain.value.ogImage },
                { key: 'twitter-image', name: 'twitter:image', content: pain.value.ogImage },
              ]
            : []),
        ]
      : [],
  })),
)
</script>

<template>
  <div class="min-h-screen">
    <div v-if="pending && !pain" class="flex justify-center items-center min-h-64">
      <p class="text-muted">{{ painPage.loading }}</p>
    </div>

    <template v-else-if="pain">
      <!-- Hero. Deliberately NOT wrapped in <ClientOnly>: this headline must
           match the ad word for word at first paint. A flip from a fallback
           would break message match on exactly the traffic that was paid for. -->
      <section class="bg-midnight sleep-pattern px-4 pt-10 pb-8">
        <div class="max-w-2xl mx-auto">
          <p v-if="pain.eyebrow" class="text-xs font-semibold text-lavender uppercase tracking-wider mb-3">
            {{ pain.eyebrow }}
          </p>
          <h1 class="font-heading text-3xl sm:text-4xl md:text-5xl text-foam leading-tight mb-4">
            {{ pain.headline }}
          </h1>
          <p v-if="pain.subhead" class="text-lavender text-base sm:text-lg leading-relaxed">
            {{ pain.subhead }}
          </p>
        </div>
      </section>

      <!-- Explanation -->
      <section v-if="renderedBody" class="px-4 py-10">
        <div class="max-w-2xl mx-auto">
          <div class="prose max-w-none" v-html="renderedBody" />
        </div>
      </section>

      <!-- Hand-off. Embedded, not linked: paid traffic that needs a second page
           load bleeds out before it arrives. -->
      <section v-if="calcType" id="kalkulaator" class="bg-midnight sleep-pattern px-4 py-10">
        <div class="max-w-xl mx-auto text-center mb-6">
          <h2 class="font-heading text-2xl sm:text-3xl text-foam leading-tight mb-2">
            {{ pain.ctaLabel }}
          </h2>
          <p class="text-sm text-lavender">{{ painPage.calcIntro }}</p>
        </div>
        <SleepCalculator
          :calc-type="calcType"
          :prefill="prefill"
          :prefilled-from="pain.slug"
        />
      </section>

      <!-- No calculator for this angle: point at the quiz or just keep reading -->
      <section v-else class="px-4 pb-10">
        <div class="max-w-2xl mx-auto">
          <NuxtLink
            to="/unetest"
            class="inline-block px-6 py-3 rounded-xl bg-gold text-midnight font-semibold text-sm hover:bg-gold/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            {{ pain.ctaLabel }}
          </NuxtLink>
          <p class="mt-2 text-xs text-muted">{{ painPage.freeNote }}</p>
        </div>
      </section>

      <!-- Related reading -->
      <section v-if="relatedPosts.length" class="max-w-2xl mx-auto px-4 py-10">
        <h2 class="font-heading text-2xl text-midnight mb-5">{{ painPage.relatedHeading }}</h2>
        <div class="space-y-0 divide-y divide-gray-100">
          <article v-for="post in relatedPosts" :key="post.id" class="py-4 first:pt-0">
            <h3 class="font-heading text-lg text-midnight leading-snug mb-1.5">
              <NuxtLink
                :to="`/artiklid/${post.slug}`"
                class="hover:text-dusk transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              >
                {{ post.title }}
              </NuxtLink>
            </h3>
            <p class="text-sm text-midnight/75 leading-relaxed line-clamp-2">{{ post.excerpt }}</p>
            <span class="text-xs text-muted/70">{{ blogPage.readingTime(post.readingTimeMin) }}</span>
          </article>
        </div>
      </section>

      <div class="max-w-2xl mx-auto px-4 pb-12">
        <NuxtLink
          to="/"
          class="text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
        >
          {{ painPage.backHome }}
        </NuxtLink>
      </div>
    </template>

    <p v-else class="text-center py-20 text-muted">{{ common.loading }}</p>
  </div>
</template>
