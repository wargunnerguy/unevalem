<script setup lang="ts">
import type { Stat } from '~/types'

const { data: statsData } = useFetch<Stat[]>('/api/stats', { default: () => [] as Stat[] })

const announcement = computed(() =>
  (statsData.value ?? []).find(s => s.key === 'announcement' && s.active),
)

const dismissed = ref(false)
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="announcement && !dismissed"
        class="bg-dusk border-b border-lavender/20 px-4 py-2.5"
      >
        <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p class="text-sm text-foam/90 leading-snug">
            <span class="font-semibold text-lavender mr-2">{{ announcement.value }}</span>{{ announcement.displayText }}
          </p>
          <button
            type="button"
            class="shrink-0 text-muted hover:text-foam transition-colors text-xs leading-none p-1"
            aria-label="Sulge teadaanne"
            @click="dismissed = true"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
