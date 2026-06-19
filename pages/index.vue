<script setup lang="ts">
import { calculator, homepage, common, dailyTips } from '~/utils/copy'
import type { Stat } from '~/types'

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
const dailyTip = dailyTips[dayOfYear % 30]

const { data: statsData } = useFetch<Stat[]>('/api/stats', {
  default: () => [] as Stat[],
})
const activeStats = computed(() => (statsData.value ?? []).filter(s => s.active))

const featuredPosts = useFeaturedPosts(5)

// A/B variant — client-only (avoids SSR hydration flash for heading)
const { variant } = useABTest()
const variantHeading = computed(() =>
  calculator.variantHeadings[variant.value] ?? calculator.heroHeading,
)
const variantSubtext = computed(() =>
  calculator.variantSubtexts[variant.value] ?? calculator.heroSubtext,
)

// Revisit banner — shown when visitor has completed the calc before
interface LastCalc { pillow: string; blanket: string; score: number; improved: number; completedAt: string }
const lastCalc = ref<LastCalc | null>(null)
const showRevisit = ref(true)

onMounted(() => {
  try {
    const raw = localStorage.getItem('unevalem-last-calc')
    if (raw) lastCalc.value = JSON.parse(raw) as LastCalc
  } catch {}
})
</script>

<template>
  <div>

    <!-- ─── HERO — dark band, calculator as centrepiece ─── -->
    <section class="bg-midnight px-4 pt-10 pb-12">

      <!-- Revisit banner — shows only if they've completed the calc before -->
      <ClientOnly>
        <Transition name="toast">
          <div
            v-if="lastCalc && showRevisit"
            class="max-w-xl mx-auto mb-5 bg-dusk/70 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
          >
            <div class="text-sm text-foam leading-snug">
              <span class="font-medium text-gold">Tere tagasi!</span>
              Sinu eelmine tulemus: <span class="font-medium">{{ lastCalc.pillow }}</span> + <span class="font-medium">{{ lastCalc.blanket }}</span>
              <span class="text-muted"> (skoor {{ lastCalc.improved }}/100)</span>
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

      <div class="max-w-xl mx-auto text-center mb-7">
        <!-- Variant-specific heading (ClientOnly to avoid hydration mismatch) -->
        <ClientOnly>
          <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight mb-3">
            {{ variantHeading }}
          </h1>
          <p class="text-lavender text-base md:text-lg">
            {{ variantSubtext }}
          </p>
          <template #fallback>
            <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight mb-3">
              {{ calculator.heroHeading }}
            </h1>
            <p class="text-lavender text-base md:text-lg">
              {{ calculator.heroSubtext }}
            </p>
          </template>
        </ClientOnly>
      </div>

      <SleepCalculator />
    </section>

    <!-- ─── STATS STRIP ─── -->
    <section v-if="activeStats.length" class="bg-dusk px-4 py-6">
      <div class="max-w-4xl mx-auto">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            v-for="stat in activeStats"
            :key="stat.key"
            class="text-center"
          >
            <p class="font-heading text-2xl sm:text-3xl text-foam font-bold leading-none mb-1">
              {{ stat.value }}
            </p>
            <p class="text-xs text-lavender/80 leading-tight">
              {{ stat.displayText }}
            </p>
          </div>
        </div>
      </div>
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

    <!-- ─── FEATURED ARTICLES — vertical stacked list ─── -->
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

            <p class="text-sm text-muted leading-relaxed mb-3 line-clamp-2">
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
