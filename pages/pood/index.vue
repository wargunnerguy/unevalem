<script setup lang="ts">
import type { Product } from '~/types'

useHead({
  title: 'Pood — Bambuspadi, bambustekk ja rohkem | Unevalem',
  meta: [
    { name: 'description', content: 'Unevalem tootevalik: bambuspadjad, bambustekid ja voodipesu, mis toetavad paremat und.' },
    { property: 'og:title', content: 'Unevalem Pood' },
    { property: 'og:url', content: 'https://unevalem.ee/pood' },
  ],
})

const { getByCategory, pending } = useProducts()

interface CategorySection {
  key: Product['category']
  heading: string
  description: string
  comingSoon?: boolean
}

const sections: CategorySection[] = [
  { key: 'pillow',     heading: 'Padjad',     description: 'Bambuspadjad erinevate magamisasendite ja kehaehituste jaoks.' },
  { key: 'blanket',    heading: 'Tekid',      description: 'Bambustekid kõikidele — suvemudelitest talvetekideni.' },
  { key: 'pillowcase', heading: 'Padjapüürid', description: 'Hingavad bambuspadjapüürid, mis on õrnad nahale.' },
  { key: 'duvetcover', heading: 'Tekikotid',  description: 'Bambustekikotid, mis parandavad teki termoregulatsiooni.' },
  { key: 'mattress',   heading: 'Madratsid',  description: 'Kvaliteetsed bambusmadratsid.', comingSoon: true },
  { key: 'sheet',      heading: 'Voodilinad', description: 'Bambusest voodilinad.', comingSoon: true },
]
</script>

<template>
  <div class="min-h-screen bg-moonlight">

    <!-- Header -->
    <div class="bg-midnight px-4 py-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">Pood</h1>
        <p class="mt-2 text-lavender text-base">
          Bambusest voodimaterjalid, mis toetavad paremat und.
          Toodete valik kasvab — kontrolli regulaarselt.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-10">

      <div v-if="pending" class="flex justify-center py-16">
        <p class="text-muted">Laen tooteid...</p>
      </div>

      <div v-else class="space-y-14">
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
                class="bg-foam rounded-xl border border-gray-100 overflow-hidden hover:border-lavender/50 hover:shadow-sm transition-all duration-200 flex flex-col"
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

                  <p class="text-sm text-muted leading-relaxed flex-1 mb-3">{{ product.description }}</p>

                  <div class="flex items-center justify-between mt-auto">
                    <span class="font-semibold text-midnight text-lg">{{ product.priceText }}</span>
                    <a
                      :href="product.storeUrl !== '#' ? product.storeUrl : undefined"
                      :aria-disabled="product.storeUrl === '#' || undefined"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      :class="product.storeUrl !== '#'
                        ? 'bg-gold text-midnight hover:opacity-90'
                        : 'bg-gray-100 text-muted cursor-default'"
                    >
                      {{ product.storeUrl !== '#' ? 'Vaata toodet →' : 'Tulemas' }}
                    </a>
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

    </div>
  </div>
</template>
