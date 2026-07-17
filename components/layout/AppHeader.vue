<script setup lang="ts">
import { nav, shop } from '~/utils/copy'

const route = useRoute()
const isActive = (path: string) => route.path === path

const { isDark, toggleTheme } = useTheme()
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

        <!-- Theme toggle: sun shown in dark mode (click → light), moon in light mode (click → dark) -->
        <button
          type="button"
          class="ml-1 p-2 rounded-lg text-muted hover:text-midnight hover:bg-moonlight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
          :aria-label="isDark ? 'Lülita heledaks' : 'Lülita tumedaks'"
          :title="isDark ? 'Lülita heledaks' : 'Lülita tumedaks'"
          @click="toggleTheme"
        >
          <!-- Sun = dark mode active, click to go light -->
          <svg
            v-if="isDark"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
          </svg>
          <!-- Moon = light mode active, click to go dark -->
          <svg
            v-else
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>

    </div>
  </header>
</template>
