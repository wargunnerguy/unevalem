<script setup lang="ts">
import { nav } from '~/utils/copy'

const route = useRoute()
const isActive = (path: string) => route.path === path

const { isDark, toggleTheme } = useTheme()
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

        <!-- Theme toggle: eye open (awake) / eye closed (asleep) -->
        <button
          type="button"
          class="ml-1 p-2 rounded-lg text-muted hover:text-midnight hover:bg-moonlight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
          :aria-label="isDark ? 'Lülita heledaks' : 'Lülita tumedaks'"
          :title="isDark ? 'Ärkvel (heledam)' : 'Uinumas (tumedam)'"
          @click="toggleTheme"
        >
          <!-- Eye open = light mode active, click to go dark (sleep) -->
          <svg
            v-if="!isDark"
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
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <!-- Eye closed = dark mode active, click to go light (wake up) -->
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
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </div>

    </div>
  </header>
</template>
