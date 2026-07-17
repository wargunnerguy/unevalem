<script setup lang="ts">
import { footer, nav } from '~/utils/copy'

const year = new Date().getFullYear()
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
        <p>{{ footer.copyright(year) }}</p>
      </div>

    </div>
  </footer>
</template>
