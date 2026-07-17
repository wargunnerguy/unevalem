<script setup lang="ts">
import { shop } from '~/utils/copy'

useHead({
  title: shop.lookup.metaTitle,
  meta: [{ name: 'robots', content: 'noindex' }],
})

const sheetsApiUrl = useRuntimeConfig().public.sheetsApiUrl as string

const number = ref('')
const email = ref('')
const state = ref<'idle' | 'checking' | 'done' | 'notfound' | 'error'>('idle')
const resultStatus = ref('')

const statusText = computed(() => shop.lookup.statuses[resultStatus.value] ?? resultStatus.value)

async function submit() {
  const num = number.value.replace(/\D/g, '')
  const mail = email.value.trim()
  if (!num || !mail) return
  state.value = 'checking'
  try {
    const res = await fetch(
      `${sheetsApiUrl}?action=order_lookup&number=${encodeURIComponent(num)}&email=${encodeURIComponent(mail)}`,
    )
    const data = await res.json() as { status?: string; error?: string }
    if (data.status) {
      resultStatus.value = String(data.status).toUpperCase()
      state.value = 'done'
    } else {
      state.value = 'notfound'
    }
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-midnight sleep-pattern px-4 py-10">
      <div class="max-w-xl mx-auto">
        <h1 class="font-heading text-4xl text-foam leading-tight">{{ shop.lookup.heading }}</h1>
        <p class="mt-2 text-lavender/70 text-sm">{{ shop.lookup.intro }}</p>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4 py-10">
      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label for="lk-number" class="block text-sm font-medium text-midnight mb-1">{{ shop.lookup.numberLabel }}</label>
          <input
            id="lk-number" v-model="number" type="text" inputmode="numeric" required placeholder="1001"
            class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender"
          />
        </div>
        <div>
          <label for="lk-email" class="block text-sm font-medium text-midnight mb-1">{{ shop.lookup.emailLabel }}</label>
          <input
            id="lk-email" v-model="email" type="email" required
            class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender"
          />
        </div>
        <button
          type="submit"
          :disabled="state === 'checking'"
          class="w-full bg-midnight text-foam font-semibold py-3 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
        >
          {{ state === 'checking' ? shop.lookup.checking : shop.lookup.submit }}
        </button>
      </form>

      <div v-if="state === 'done'" class="mt-6 bg-foam border border-lavender/30 rounded-xl px-5 py-4 text-center">
        <p class="text-sm font-semibold text-midnight">{{ statusText }}</p>
      </div>
      <p v-else-if="state === 'notfound'" class="mt-6 text-sm text-muted text-center">{{ shop.lookup.notFound }}</p>
      <p v-else-if="state === 'error'" class="mt-6 text-sm text-red-600 text-center">{{ shop.lookup.error }}</p>
    </div>
  </div>
</template>
