<script setup lang="ts">
import { shop } from '~/utils/copy'

useHead({
  title: shop.thanks.metaTitle,
  meta: [{ name: 'robots', content: 'noindex' }],
})

const route = useRoute()
const orderRef = computed(() => String(route.query.ref ?? '').trim())

// Server-verified status only: the page never claims "paid" based on the
// return redirect alone — the Apps Script checks its own MAC-verified state.
type Status = 'loading' | 'paid' | 'pending' | 'failed' | 'unknown'
const status = ref<Status>('loading')

// The cart survives the payment redirect (so a cancel loses nothing) and is
// emptied only once the payment is confirmed by the server.
const { clear } = useCart()
watch(status, (s) => { if (s === 'paid') clear() })

async function fetchStatus() {
  if (!orderRef.value) { status.value = 'unknown'; return }
  const url = useRuntimeConfig().public.sheetsApiUrl as string
  try {
    const res = await fetch(`${url}?action=order_status&ref=${encodeURIComponent(orderRef.value)}`)
    const data = await res.json() as { status?: string }
    const s = String(data.status ?? '').toUpperCase()
    if (s === 'PAID') status.value = 'paid'
    else if (s === 'PENDING') status.value = 'pending'
    else if (s === 'CANCELLED' || s === 'EXPIRED' || s === 'FAILED') status.value = 'failed'
    else status.value = 'unknown'
  } catch {
    status.value = 'unknown'
  }
}

onMounted(fetchStatus)
</script>

<template>
  <div class="min-h-screen bg-moonlight">
    <div class="bg-midnight px-4 py-12">
      <div class="max-w-xl mx-auto text-center">
        <h1 class="font-heading text-3xl sm:text-4xl text-foam leading-tight">
          {{ shop.thanks.heading }}
        </h1>
        <p v-if="orderRef" class="mt-3 text-sm text-lavender/70">
          {{ shop.thanks.orderRefLabel }}: <span class="font-mono text-lavender">{{ orderRef }}</span>
        </p>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4 py-10 text-center space-y-6">

      <div v-if="status === 'loading'" class="text-sm text-muted py-4">…</div>

      <div v-else-if="status === 'paid'" class="bg-success/10 border border-success/25 rounded-xl px-5 py-4">
        <p class="text-sm text-midnight leading-relaxed">✓ {{ shop.thanks.paid }}</p>
      </div>

      <div v-else-if="status === 'pending' || status === 'unknown'" class="bg-foam border border-lavender/30 rounded-xl px-5 py-4">
        <p class="text-sm text-midnight leading-relaxed">{{ shop.thanks.pending }}</p>
      </div>

      <div v-else class="bg-foam border border-red-200 rounded-xl px-5 py-4">
        <p class="text-sm text-midnight leading-relaxed">{{ shop.thanks.failed }}</p>
      </div>

      <p v-if="status === 'paid' || status === 'pending'" class="text-xs text-muted">
        {{ shop.thanks.delivery }}
      </p>

      <NuxtLink
        to="/"
        class="inline-block text-sm font-semibold text-midnight border-b border-midnight/30 hover:border-midnight pb-0.5"
      >
        {{ shop.thanks.backHome }}
      </NuxtLink>

    </div>
  </div>
</template>
