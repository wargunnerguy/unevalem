<script setup lang="ts">
import { cookieConsent } from '~/utils/copy'

const { decided, acceptAll, necessaryOnly, analyticsOnly } = useConsent()

// Only ask when there is actually something to consent to. With no GA id and
// no pixel id configured (staging), nothing sets a cookie and the banner would
// be asking about nothing.
const config = useRuntimeConfig().public
const trackingConfigured = !!config.gaId || !!config.metaPixelId
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
        v-if="trackingConfigured && !decided"
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
          <!-- Reject is one click, same size and weight as accept. A refusal
               must never be harder than agreement. -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-midnight text-foam hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
              @click="necessaryOnly"
            >
              {{ cookieConsent.necessaryOnly }}
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-medium border border-lavender/40 text-foam/90 hover:border-lavender transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
              @click="analyticsOnly"
            >
              {{ cookieConsent.analyticsOnly }}
            </button>
            <button
              type="button"
              class="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gold text-midnight hover:bg-gold/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              @click="acceptAll"
            >
              {{ cookieConsent.acceptAll }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
