<script setup lang="ts">
import { calculator, homepage, common } from '~/utils/copy'
import type { Tip } from '~/types'

const { incrementVisit } = useReadHistory()
onMounted(() => incrementVisit())

useHead({
  title: homepage.metaTitle,
  meta: [
    { name: 'description', content: homepage.metaDescription },
    { property: 'og:title', content: homepage.metaTitle },
    { property: 'og:description', content: homepage.metaDescription },
    { property: 'og:url', content: 'https://unevalem.ee/' },
  ],
})

const dayOfYear = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
)

const { data: tipsData } = useFetch<Tip[]>('/api/tips', { default: () => [] as Tip[] })
const dailyTip = computed(() => {
  const tips = tipsData.value ?? []
  if (!tips.length) return ''
  return tips[dayOfYear % tips.length].text
})

const featuredPosts = useFeaturedPosts(5)

// The personalized order depends on cookies, so it must only apply on the client
// after mount. Until then we render a cookie/date-independent base order (still
// puts the post links in the static HTML for SEO). Swapping on `isMounted`
// avoids any hydration mismatch since server and pre-mount client agree.
const { posts: allPosts } = usePosts()
const basePosts = computed(() =>
  [...allPosts.value]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, 5),
)
const isMounted = useMounted()
const displayPosts = computed(() => (isMounted.value ? featuredPosts.value : basePosts.value))
const showPersonalizedNote = computed(() => isMounted.value && completedCount.value > 0)

// A/B variant label
const { variant } = useABTest()
const variantLabel = computed(() =>
  calculator.variantLabels[variant.value] ?? calculator.heroLabel,
)

// Session — for revisit banner (client-only to avoid hydration mismatch)
const { siteProfile, completedCount, activeCalcType } = useCalcSession()

const showRevisit = ref(true)

const revisitSummary = computed(() => {
  const p = siteProfile.value
  const parts: string[] = []
  if (p.pillow?.productName) parts.push(`Padi: ${p.pillow.productName}`)
  if (p.blanket?.productName) parts.push(`Tekk: ${p.blanket.productName}`)
  if (p.mattress?.productName) parts.push(`Madrats: ${p.mattress.productName}`)
  return parts
})
</script>

<template>
  <div>

    <!-- ─── HERO ─── -->
    <section class="bg-midnight px-4 pt-8 pb-10">

      <!-- Revisit banner — shown only on client after hydration -->
      <ClientOnly>
        <Transition name="toast">
          <div
            v-if="completedCount > 0 && showRevisit"
            class="max-w-xl mx-auto mb-5 bg-dusk/70 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
          >
            <div class="text-sm text-foam leading-snug">
              <span class="font-medium text-gold">Tere jälle!</span>
              <span v-if="completedCount < 3"> Jätka oma une profiili täitmist — </span>
              <span v-else> Sinu une profiil on täielik — </span>
              <span class="text-muted text-xs">{{ revisitSummary.join(' · ') }}</span>
            </div>
            <button
              type="button"
              class="shrink-0 text-muted hover:text-foam transition-colors text-sm leading-none mt-0.5"
              aria-label="Sulge"
              @click="showRevisit = false"
            >
              ✕
            </button>
          </div>
        </Transition>
      </ClientOnly>

      <!-- Hero heading — updates as active calc type changes -->
      <div class="max-w-xl mx-auto text-center mb-6">
        <ClientOnly>
          <Transition name="slide-left" mode="out-in">
            <div :key="activeCalcType">
              <h1 class="font-heading text-3xl sm:text-4xl text-foam leading-tight mb-2">
                {{ calculator.heroTitle[activeCalcType] }}
              </h1>
            </div>
          </Transition>
          <p class="mt-2 text-lavender/40 text-xs flex items-center justify-center gap-1.5">
            <span aria-hidden="true">🔬</span>{{ calculator.researchBadge }}
          </p>
          <template #fallback>
            <h1 class="font-heading text-3xl sm:text-4xl text-foam leading-tight mb-2">
              {{ calculator.heroTitle.pillow }}
            </h1>
          </template>
        </ClientOnly>
      </div>

      <SleepCalculator />
    </section>

    <!-- ─── VALUE CLAIMS STRIP ─── -->
    <section class="bg-dusk px-4 py-6">
      <div class="max-w-xl mx-auto flex justify-center gap-6 sm:gap-10">
        <div
          v-for="claim in homepage.valueClaims"
          :key="claim.title"
          class="text-center"
        >
          <p class="font-heading text-gold text-lg sm:text-xl font-bold leading-none">
            {{ claim.title }}
          </p>
          <p class="text-lavender/70 text-xs mt-1.5 leading-snug max-w-[140px]">
            {{ claim.text }}
          </p>
        </div>
      </div>
    </section>

    <!-- ─── DAILY TIP ─── -->
    <section class="bg-moonlight px-4 py-8">
      <div class="max-w-xl mx-auto">
        <div class="flex gap-3 items-start p-4 rounded-xl border border-lavender/25 bg-foam shadow-sm">
          <span class="text-xl shrink-0 mt-0.5" aria-hidden="true">🌙</span>
          <div>
            <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              {{ homepage.dailyTipHeading }}
            </p>
            <p class="text-sm text-midnight leading-relaxed">{{ dailyTip }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURED ARTICLES ─── -->
    <section v-if="displayPosts.length" class="bg-moonlight px-4 pb-14 pt-2">
      <div class="max-w-2xl mx-auto">
        <p v-if="showPersonalizedNote" class="text-xs font-semibold text-lavender uppercase tracking-wider mb-2">
          {{ homepage.personalizedNote }}
        </p>
        <h2 class="font-heading text-2xl md:text-3xl text-midnight mb-7">
          {{ homepage.featuredPostsHeading }}
        </h2>

        <div class="space-y-0 divide-y divide-gray-100">
          <article
            v-for="post in displayPosts"
            :key="post.id"
            class="py-5 first:pt-0"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full border border-lavender/30 bg-foam text-midnight">
                {{ post.category }}
              </span>
              <span v-if="post.isFeatured" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold text-midnight">
                {{ common.popularBadge }}
              </span>
            </div>

            <h3 class="font-heading text-xl text-midnight leading-snug mb-2 hover:text-dusk transition-colors">
              <NuxtLink :to="`/artiklid/${post.slug}`" class="focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ post.title }}
              </NuxtLink>
            </h3>

            <p class="text-sm text-midnight leading-relaxed mb-3 line-clamp-2">
              {{ post.excerpt }}
            </p>

            <div class="flex items-center justify-between">
              <span class="text-xs text-muted/70">{{ post.readingTimeMin }} min</span>
              <NuxtLink
                :to="`/artiklid/${post.slug}`"
                class="text-sm font-semibold text-midnight border-b border-midnight/30 hover:border-midnight pb-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              >
                {{ common.readMore }} →
              </NuxtLink>
            </div>
          </article>
        </div>

        <div class="mt-8">
          <NuxtLink
            to="/artiklid"
            class="inline-block font-semibold text-midnight border-b-2 border-midnight/30 hover:border-midnight pb-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
          >
            {{ common.allArticles }}
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>
