<script setup lang="ts">
import { nav, shop } from '~/utils/copy'

const route = useRoute()
const isActive = (path: string) => route.path === path

const { count, open } = useCart()
</script>

<template>
  <header class="bg-foam border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

      <!-- Logo -->
      <NuxtLink to="/" class="shrink-0 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
        <img src="/unevalem_logo.png" alt="" aria-hidden="true" class="h-8 w-auto" />
        <span class="font-heading text-2xl text-midnight leading-none">{{ nav.logo }}</span>
      </NuxtLink>

      <div class="flex items-center gap-1 sm:gap-2">
        <!-- Nav -->
        <nav aria-label="Põhinavigatsioon">
          <ul class="flex items-center gap-1 sm:gap-2">
            <li v-for="link in [
              { to: '/', label: nav.home },
              { to: '/artiklid', label: nav.articles },
              { to: '/unetest', label: nav.quiz },
              { to: '/pood', label: nav.shop },
            ]" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                :class="isActive(link.to)
                  ? 'bg-midnight text-gold'
                  : 'text-muted hover:text-midnight hover:bg-moonlight'"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Cart -->
        <ClientOnly>
          <button
            type="button"
            class="relative p-2 rounded-lg text-muted hover:text-midnight hover:bg-moonlight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
            :aria-label="shop.cart.ariaOpen"
            @click="open"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              v-if="count"
              class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gold text-midnight text-[10px] font-bold leading-4 text-center tabular-nums"
            >
              {{ count }}
            </span>
          </button>
        </ClientOnly>

        <!-- Theme toggle: slider switch (sun ↔ moon) -->
        <ThemeSwitch />
      </div>

    </div>
  </header>
</template>
