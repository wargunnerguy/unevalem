<script setup lang="ts">
import { calculator, homepage, common } from '~/utils/copy'
import type { Stat, Tip } from '~/types'

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

const { data: statsData } = useFetch<Stat[]>('/api/stats', {
  default: () => [] as Stat[],
})
const calcStat = computed(() =>
  (statsData.value ?? []).find(s => s.key === 'calculatorCompletions' && s.active),
)

const featuredPosts = useFeaturedPosts(5)

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

      <!-- Single short label -->
      <div class="max-w-xl mx-auto text-center mb-4">
        <ClientOnly>
          <p class="text-lavender/70 text-sm tracking-wide">{{ variantLabel }}</p>
          <template #fallback>
            <p class="text-lavender/70 text-sm tracking-wide">{{ calculator.heroLabel }}</p>
          </template>
        </ClientOnly>
      </div>

      <SleepCalculator />
    </section>

    <!-- ─── STATS STRIP ─── -->
    <section v-if="calcStat" class="bg-dusk px-4 py-5">
      <p class="text-center text-sm text-lavender/80">
        <span class="font-heading text-foam text-lg font-bold mr-1.5">{{ calcStat.value }}</span>{{ calcStat.displayText }}
      </p>
    </section>

    <!-- ─── DAILY TIP ─── -->
    <section class="bg-moonlight px-4 py-8">
      <div class="max-w-xl mx-auto">
        <div class="flex gap-3 items-start p-4 rounded-xl border border-lavender/25 bg-foam shadow-sm">
          <span class="text-xl shrink-0 mt-0.5" aria-hidden="true">🌙</span>
          <div>
            <p class="text-xs font-semibold text-lavender uppercase tracking-wider mb-1.5">
              {{ homepage.dailyTipHeading }}
            </p>
            <p class="text-sm text-midnight leading-relaxed">{{ dailyTip }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURED ARTICLES ─── -->
    <section v-if="featuredPosts.length" class="bg-moonlight px-4 pb-14 pt-2">
      <div class="max-w-2xl mx-auto">
        <h2 class="font-heading text-2xl md:text-3xl text-midnight mb-7">
          {{ homepage.featuredPostsHeading }}
        </h2>

        <div class="space-y-0 divide-y divide-gray-100">
          <article
            v-for="post in featuredPosts"
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

            <p class="text-sm text-midnight/70 leading-relaxed mb-3 line-clamp-2">
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
