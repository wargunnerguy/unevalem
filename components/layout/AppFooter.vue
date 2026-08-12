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
    <!-- One centred column at every breakpoint. The old brand-left / links-right
         split degraded badly below sm: the six links wrapped into a ragged
         block against a left-aligned brand, which is what read as "thrown
         together". A single centred stack is the same layout everywhere, so
         there is no breakpoint where it falls apart. -->
    <div class="max-w-5xl mx-auto px-4 py-10 sm:py-12 text-center">

      <!-- Brand -->
      <div>
        <span class="font-heading text-xl text-foam">{{ nav.logo }}</span>
        <p class="text-sm text-muted mt-1">{{ footer.tagline }}</p>
      </div>

      <!-- Links -->
      <nav aria-label="Jaluse navigatsioon" class="mt-6">
        <ul class="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted">
          <li>
            <NuxtLink to="/artiklid" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ nav.articles }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/unetest" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ nav.quiz }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/tellimus" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ footer.links.orderStatus }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/meist" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ footer.links.about }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/muugitingimused" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ footer.links.terms }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/privaatsus" class="inline-block py-1.5 sm:py-0 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
              {{ footer.links.privacy }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- The quiet, permanent sign-up surface: out of the way, easy to find,
           never in anyone's face. -->
      <div class="mt-8 max-w-md mx-auto">
        <LeadForm source="footer" variant="dark" align="center" />
      </div>

      <!-- Legal. Constrained and centred: `footer.legal` is a long ·-separated
           string that wrapped into two lopsided left-aligned lines, which is
           what looked forced. max-w-md gives it a predictable break. -->
      <div class="text-xs text-muted/60 mt-10 border-t border-dusk pt-6 max-w-md mx-auto space-y-1.5 leading-relaxed">
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
