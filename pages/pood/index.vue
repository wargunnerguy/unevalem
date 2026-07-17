<script setup lang="ts">
import type { Product, UserProfile } from '~/types'
import { disclosure, shop } from '~/utils/copy'

useHead({
  title: 'Pood — padjad, tekid ja voodipesu | Unevalem',
  meta: [
    { name: 'description', content: 'Unevalemi pood: tööriistad heaks uneks — padjad, tekid ja voodipesu, mis aitavad sul paremini magada.' },
    { property: 'og:title', content: 'Unevalem Pood' },
    { property: 'og:url', content: 'https://unevalem.ee/pood' },
  ],
})

const { products, getByCategory, pending } = useProducts()
const { add } = useCart()

// Which product's waitlist form is expanded (one at a time keeps cards tidy)
const waitlistOpen = ref<string | null>(null)

// ── Profile fit ────────────────────────────────────────────────────────────
// After the sleep test, products get a fit percentage (attribute overlap
// with the user's answers — see productMatchPercent for why it's phrased as
// fit, never as a sleep-improvement promise). Cookie-dependent, so it only
// applies after mount to avoid hydration mismatches.
const { siteProfile } = useCalcSession()
const isMounted = useMounted()

const answersByCalc = computed(() => ({
  pillow:   siteProfile.value.pillow?.answers as Partial<UserProfile> | undefined,
  blanket:  siteProfile.value.blanket?.answers as Partial<UserProfile> | undefined,
  mattress: siteProfile.value.mattress?.answers as Partial<UserProfile> | undefined,
}))

const matchById = computed(() => {
  const map = new Map<string, number>()
  if (!isMounted.value) return map
  for (const p of products.value ?? []) {
    if (!p.active) continue
    const pct = productMatchPercent(p, answersByCalc.value)
    if (pct !== null) map.set(p.id, pct)
  }
  return map
})

// The single best fit across the whole shop (needs a meaningful score)
const bestMatchId = computed(() => {
  let best: string | null = null
  let bestPct = 49 // floor: below half, "parim valik" would be misleading
  for (const [id, pct] of matchById.value) {
    if (pct > bestPct) { best = id; bestPct = pct }
  }
  return best
})

const hasAnyMatch = computed(() => matchById.value.size > 0)

// Product structured data — deliberately NO aggregateRating (we have no
// reviews; fabricating them would be a Google penalty and dishonest).
useHead(computed(() => ({
  script: (products.value ?? []).length
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: (products.value ?? []).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Product',
              name: p.name,
              description: p.description,
              ...(p.imageUrl ? { image: p.imageUrl } : {}),
              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/PreOrder',
                url: 'https://unevalem.ee/pood',
              },
            },
          })),
        }),
      }]
    : [],
})))

interface CategorySection {
  key: Product['category']
  heading: string
  description: string
  comingSoon?: boolean
}

// Material-neutral copy: the range spans bamboo, wool, silk, cotton,
// synthetics and more — and it changes, so categories don't name materials.
const sections: CategorySection[] = [
  { key: 'pillow',     heading: 'Padjad',     description: 'Padjad erinevate magamisasendite ja kehaehituste jaoks.' },
  { key: 'blanket',    heading: 'Tekid',      description: 'Tekid igale magajale — kergetest suvetekkidest soojade talvetekideni.' },
  { key: 'pillowcase', heading: 'Padjapüürid', description: 'Hingavad padjapüürid, mis on õrnad nahale.' },
  { key: 'duvetcover', heading: 'Tekikotid',  description: 'Tekikotid, mis toetavad teki termoregulatsiooni.' },
  { key: 'mattress',   heading: 'Madratsid',  description: 'Kvaliteetsed madratsid.', comingSoon: true },
  { key: 'sheet',      heading: 'Voodilinad', description: 'Voodilinad eri materjalidest.', comingSoon: true },
]
</script>

<template>
  <div class="min-h-screen">

    <!-- Header -->
    <div class="bg-midnight sleep-pattern px-4 py-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">Pood</h1>
        <p class="mt-2 text-lavender text-base">
          Tööriistad heaks uneks — padjad, tekid ja muu,
          mis aitavad sul paremini magada. Valik kasvab.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-10">

      <div v-if="pending" class="flex justify-center py-16">
        <p class="text-muted">Laen tooteid...</p>
      </div>

      <div v-else class="space-y-14">
        <!-- What the fit % means (liability-safe framing) -->
        <p v-if="hasAnyMatch" class="!mt-0 text-xs text-muted leading-snug max-w-2xl">
          {{ shop.match.note }}
        </p>
        <section
          v-for="section in sections"
          :key="section.key"
        >
          <!-- Section header -->
          <div class="mb-5">
            <h2 class="font-heading text-2xl text-midnight">{{ section.heading }}</h2>
            <p class="text-sm text-muted mt-1">{{ section.description }}</p>
          </div>

          <!-- Products grid -->
          <template v-if="!section.comingSoon && getByCategory(section.key).length">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article
                v-for="product in getByCategory(section.key)"
                :key="product.id"
                class="bg-foam rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200 flex flex-col"
                :class="product.id === bestMatchId
                  ? 'border-2 border-success shadow-sm'
                  : 'border border-gray-100 hover:border-lavender/50'"
              >
                <!-- Image or placeholder -->
                <div class="aspect-[4/3] bg-gradient-to-br from-midnight to-dusk flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    v-if="product.imageUrl"
                    :src="product.imageUrl"
                    :alt="product.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-5xl opacity-10 select-none" aria-hidden="true">🛏️</span>
                </div>

                <div class="p-4 flex flex-col flex-1">
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <h3 class="font-heading text-base text-midnight leading-snug">{{ product.name }}</h3>
                    <span v-if="product.isFeatured" class="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-gold text-midnight font-semibold">
                      Populaarne
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 flex-wrap mb-2">
                    <span class="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border border-lavender/40 text-muted">
                      {{ isExternalStore(product.storeUrl) ? disclosure.externalBadge : disclosure.ownBadge }}
                    </span>
                    <span
                      v-if="product.id === bestMatchId"
                      class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-foam"
                    >
                      ✓ {{ shop.match.bestBadge }}
                    </span>
                    <span
                      v-else-if="(matchById.get(product.id) ?? 0) >= 60"
                      class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border border-success/50 text-success"
                    >
                      {{ shop.match.goodBadge(matchById.get(product.id)!) }}
                    </span>
                  </div>

                  <p class="text-sm text-muted leading-relaxed flex-1 mb-3">{{ product.description }}</p>

                  <div class="mt-auto space-y-2.5">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-midnight text-lg">{{ product.priceText }}</span>

                      <!-- External product: link out -->
                      <a
                        v-if="isExternalStore(product.storeUrl)"
                        :href="product.storeUrl"
                        target="_blank"
                        rel="noopener"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-midnight hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        Vaata toodet →
                      </a>

                      <!-- Own product in stock: add to cart -->
                      <button
                        v-else-if="product.available"
                        type="button"
                        class="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-midnight hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        @click="add(product.id)"
                      >
                        {{ shop.addToCart }}
                      </button>

                      <!-- Out of stock: waitlist toggle -->
                      <button
                        v-else
                        type="button"
                        class="px-4 py-2 rounded-lg text-sm font-medium border border-midnight/25 text-midnight hover:bg-midnight/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                        :aria-expanded="waitlistOpen === product.id"
                        @click="waitlistOpen = waitlistOpen === product.id ? null : product.id"
                      >
                        {{ shop.notifyMe }}
                      </button>
                    </div>

                    <WaitlistForm v-if="waitlistOpen === product.id && !product.available" :product-id="product.id" />
                  </div>
                </div>
              </article>
            </div>
          </template>

          <!-- Coming soon placeholder -->
          <div
            v-else
            class="bg-foam rounded-xl border border-dashed border-gray-200 p-8 text-center"
          >
            <p class="text-muted text-sm">Tulemas peagi</p>
          </div>

        </section>
      </div>

      <!-- Transparency note — out of the way at the page's end -->
      <p class="mt-12 text-[11px] text-muted/80 leading-snug max-w-2xl">
        {{ disclosure.short }}
        <NuxtLink to="/meist" class="underline underline-offset-2 hover:text-midnight">{{ disclosure.linkLabel }}</NuxtLink>
      </p>

    </div>
  </div>
</template>
