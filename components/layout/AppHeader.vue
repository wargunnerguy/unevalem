<script setup lang="ts">
import { nav } from '~/utils/copy'

const route = useRoute()
const isActive = (path: string) => route.path === path
</script>

<template>
  <header class="bg-foam border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

      <!-- Logo -->
      <NuxtLink to="/" class="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded">
        <span class="font-serif text-2xl text-midnight leading-none">{{ nav.logo }}</span>
      </NuxtLink>

      <!-- Nav -->
      <nav aria-label="Põhinavigatsioon">
        <ul class="flex items-center gap-1 sm:gap-2">
          <li v-for="link in [
            { to: '/', label: nav.home },
            { to: '/artiklid', label: nav.articles },
            { to: '/viktoriin', label: nav.quiz },
          ]" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
              :class="isActive(link.to)
                ? 'bg-midnight text-foam'
                : 'text-muted hover:text-midnight hover:bg-moonlight'"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

    </div>
  </header>
</template>
