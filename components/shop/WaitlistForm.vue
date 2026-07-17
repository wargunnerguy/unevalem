<script setup lang="ts">
import { shop } from '~/utils/copy'

const props = defineProps<{ productId: string }>()

const email = ref('')
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')

async function submit() {
  const value = email.value.trim()
  if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || state.value === 'sending') return
  state.value = 'sending'
  const url = useRuntimeConfig().public.sheetsApiUrl as string
  try {
    // no-cors: Apps Script redirects break CORS preflights; fire-and-forget
    // like the other write actions. The script validates + timestamps.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'waitlist', email: value, productId: props.productId }),
    })
    state.value = 'done'
    gaEvent('waitlist_signup', { product_id: props.productId })
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div>
    <p v-if="state === 'done'" class="text-sm text-success font-medium py-1.5">
      {{ shop.notifyConfirm }}
    </p>
    <form v-else class="space-y-1.5" @submit.prevent="submit">
      <div class="flex gap-2">
        <label class="sr-only" :for="`waitlist-${productId}`">{{ shop.checkout.email }}</label>
        <input
          :id="`waitlist-${productId}`"
          v-model="email"
          type="email"
          required
          :placeholder="shop.notifyPlaceholder"
          class="flex-1 min-w-0 rounded-lg border border-lavender/40 bg-foam px-3 py-2 text-sm text-midnight placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-lavender"
        />
        <button
          type="submit"
          :disabled="state === 'sending'"
          class="shrink-0 px-3 py-2 rounded-lg text-sm font-medium bg-midnight text-foam hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
        >
          {{ shop.notifySubmit }}
        </button>
      </div>
      <p v-if="state === 'error'" class="text-xs text-red-600">{{ shop.notifyError }}</p>
      <p class="text-[11px] text-muted/80 leading-snug">
        {{ shop.notifyGdpr }}
        <NuxtLink to="/privaatsus" class="underline underline-offset-2 hover:text-midnight">{{ shop.notifyGdprLink }}</NuxtLink>
      </p>
    </form>
  </div>
</template>
