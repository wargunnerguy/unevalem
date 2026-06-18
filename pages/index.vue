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

// Rotates by day-of-year; changes with each daily build
const dayOfYear = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000,
)
const dailyTip = dailyTips[dayOfYear % 30]

// Stats (active only)
const { data: statsData } = useFetch<Stat[]>('/api/stats', {
  default: () => [] as Stat[],
})
const activeStats = computed(() => (statsData.value ?? []).filter(s => s.active))

// Featured posts (up to 3)
const featuredPosts = useFeaturedPosts(3)
</script>

<template>
  <div>

    <!-- ─── HERO — dark band, calculator as centrepiece ─── -->
    <section class="bg-midnight px-4 pt-10 pb-12">
      <div class="max-w-xl mx-auto text-center mb-7">
        <h1 class="font-serif text-4xl md:text-5xl text-foam leading-tight mb-3">
          {{ calculator.heroHeading }}
        </h1>
        <p class="text-lavender text-base md:text-lg">
          {{ calculator.heroSubtext }}
        </p>
      </div>

      <!-- Calculator -->
      <SleepCalculator />

      <!-- Stats line -->
      <div v-if="activeStats.length" class="max-w-xl mx-auto mt-5 text-center space-y-1">
        <p
          v-for="stat in activeStats"
          :key="stat.key"
          class="text-sm text-muted"
        >
          {{ stat.value }} {{ stat.displayText }}
        </p>
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

    <!-- ─── FEATURED POSTS ─── -->
    <section v-if="featuredPosts.length" class="bg-moonlight px-4 pb-12 pt-2">
      <div class="max-w-4xl mx-auto">
        <h2 class="font-serif text-2xl md:text-3xl text-midnight text-center mb-7">
          {{ homepage.featuredPostsHeading }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <PostCard
            v-for="post in featuredPosts"
            :key="post.id"
            :post="post"
          />
        </div>

        <div class="text-center mt-8">
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
