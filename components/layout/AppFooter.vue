<script setup lang="ts">
import { contact, footer, nav } from '~/utils/copy'

const year = new Date().getFullYear()

// Phone is decoded only in the browser so it's absent from the prerendered
// HTML (scraper defence). raw "+37253447499" → display "+372 5344 7499".
const phone = ref<{ display: string; href: string } | null>(null)
onMounted(() => {
  if (!contact.phoneEncoded) return
  const raw = atob(contact.phoneEncoded)
  const nat = raw.replace(/^\+372/, '')
  const display = nat.length === 8
    ? `+372 ${nat.slice(0, 4)} ${nat.slice(4)}`
    : raw
  phone.value = { display, href: `tel:${raw}` }
})
</script>

<template>
  <footer class="bg-midnight text-foam mt-auto">
    <div class="max-w-5xl mx-auto px-4 py-8">

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- Brand -->
        <div>
          <span class="font-heading text-xl text-foam">{{ nav.logo }}</span>
          <p class="text-sm text-muted mt-1 max-w-xs">{{ footer.tagline }}</p>
        </div>

        <!-- Links -->
        <nav aria-label="Jaluse navigatsioon">
          <ul class="flex flex-wrap items-center gap-4 text-sm text-muted">
            <li>
              <NuxtLink to="/artiklid" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ nav.articles }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/unetest" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ nav.quiz }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tellimus" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ footer.links.orderStatus }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/meist" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ footer.links.about }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/muugitingimused" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ footer.links.terms }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privaatsus" class="hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
                {{ footer.links.privacy }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="text-xs text-muted/60 mt-6 border-t border-dusk pt-4 space-y-1">
        <p>{{ footer.legal }}</p>
        <ClientOnly>
          <p v-if="phone">
            {{ contact.phoneLabel }}:
            <a :href="phone.href" class="hover:text-foam transition-colors">{{ phone.display }}</a>
          </p>
        </ClientOnly>
        <p>{{ footer.copyright(year) }}</p>
      </div>

    </div>
  </footer>
</template>
