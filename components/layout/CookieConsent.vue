<script setup lang="ts">
import { cookieConsent } from '~/utils/copy'

const { consent, grant, deny } = useConsent()

// Only ask for consent when analytics is actually configured — otherwise no
// cookies are set and there is nothing to consent to.
const gaEnabled = !!useRuntimeConfig().public.gaId
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="gaEnabled && consent === null"
        class="fixed bottom-0 inset-x-0 z-[60] bg-dusk border-t border-lavender/20 px-4 py-3"
        role="dialog"
        aria-label="Küpsiste nõusolek"
      >
        <div class="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <p class="text-sm text-foam/90 leading-snug flex-1">
            {{ cookieConsent.text }}
            <NuxtLink
              to="/privaatsus"
              class="text-lavender underline underline-offset-2 hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
            >
              {{ cookieConsent.learnMore }}
            </NuxtLink>
          </p>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foam transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
              @click="deny"
            >
              {{ cookieConsent.decline }}
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gold text-midnight hover:bg-gold/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              @click="grant"
            >
              {{ cookieConsent.accept }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
