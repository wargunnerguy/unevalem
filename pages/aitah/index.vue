<script setup lang="ts">
import { shop } from '~/utils/copy'

useHead({
  title: shop.thanks.metaTitle,
  meta: [{ name: 'robots', content: 'noindex' }],
})

const route = useRoute()
// On the prerendered static build route.query can still be empty when the
// component mounts (it fills in just after hydration) — window.location is
// the ground truth, so fall back to it on the client.
const orderRef = computed(() => {
  const fromRoute = String(route.query.ref ?? '').trim()
  if (fromRoute) return fromRoute
  if (import.meta.client) {
    return String(new URLSearchParams(window.location.search).get('ref') ?? '').trim()
  }
  return ''
})

// Captured at setup: composables are not callable from timer callbacks.
const sheetsApiUrl = useRuntimeConfig().public.sheetsApiUrl as string

// Server-verified status only: the page never claims "paid" based on the
// return redirect alone — the Apps Script checks its own MAC-verified state.
type Status = 'loading' | 'paid' | 'pending' | 'failed' | 'unknown'
const status = ref<Status>('loading')

interface OrderSummary {
  items: { name: string; qty: number; price: number }[]
  total: number
  shipMethod: string
  terminalName: string
}
const order = ref<OrderSummary | null>(null)
const orderNumber = ref<number | null>(null)

// Human-facing id: the short numeric order number when the backend provides
// it, otherwise the raw ref (old orders).
const displayOrderId = computed(() => orderNumber.value ?? orderRef.value)

const carrierNames: Record<string, string> = {
  omniva: 'Omniva pakiautomaat',
  smartpost: 'SmartPost pakiautomaat',
}

function eur(n: number): string {
  return `${n.toFixed(2).replace('.', ',')} €`
}

// The cart survives the payment redirect (so a cancel loses nothing) and is
// emptied only once the payment is confirmed by the server. The checkout
// note is also cleared then — it belonged to this order; contact details
// stay for the next purchase.
const { clear } = useCart()
watch(status, (s) => {
  if (s !== 'paid') return
  clear()
  try {
    const saved = JSON.parse(localStorage.getItem('uva-checkout') ?? 'null')
    if (saved && typeof saved === 'object') {
      saved.note = ''
      localStorage.setItem('uva-checkout', JSON.stringify(saved))
    }
  } catch { /* ignore malformed storage */ }
})

// Tab title mirrors the state so the buyer sees progress without focusing
// the tab (a real navigation spinner can't be triggered from script).
watchEffect(() => {
  if (!import.meta.client) return
  if (status.value === 'paid') document.title = shop.thanks.tabPaid
  else if (status.value === 'loading' || status.value === 'pending' || status.value === 'unknown') {
    document.title = shop.thanks.tabPending
  }
})

async function fetchStatus() {
  // No ref yet: the static-host redirect + hydration can briefly leave the
  // URL without its query string — stay in 'loading' and let the poll retry.
  if (!orderRef.value) return
  try {
    const res = await fetch(`${sheetsApiUrl}?action=order_status&ref=${encodeURIComponent(orderRef.value)}`)
    const data = await res.json() as { status?: string; orderNumber?: number } & Partial<OrderSummary>
    const s = String(data.status ?? '').toUpperCase()
    if (s === 'PAID' || s === 'SHIPPED') status.value = 'paid'
    else if (s === 'PENDING') status.value = 'pending'
    else if (s === 'CANCELLED' || s === 'EXPIRED' || s === 'FAILED') status.value = 'failed'
    else status.value = 'unknown'
    if (data.orderNumber) orderNumber.value = Number(data.orderNumber)
    // Older script versions return only {status} — the summary is optional.
    if (Array.isArray(data.items) && data.items.length) {
      order.value = {
        items: data.items,
        total: Number(data.total) || 0,
        shipMethod: String(data.shipMethod ?? ''),
        terminalName: String(data.terminalName ?? ''),
      }
    }
  } catch {
    status.value = 'unknown'
  }
}

// The payment notification is asynchronous, so the order is often still
// PENDING when the buyer lands here. Poll until it resolves (or ~2 min).
// The poll starts unconditionally: at mount the query string may not have
// settled yet (see fetchStatus), so a single up-front check can't be trusted.
let pollTimer: ReturnType<typeof setInterval> | null = null
function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}
onMounted(() => {
  fetchStatus()
  // React the moment the router surfaces the ref (usually within a tick).
  watch(orderRef, (ref) => { if (ref) fetchStatus() })
  const startedAt = Date.now()
  pollTimer = setInterval(async () => {
    // Genuinely ref-less visit: give the URL 5s to settle, then stop guessing.
    if (!orderRef.value && Date.now() - startedAt > 5000) {
      status.value = 'unknown'
      stopPolling()
      return
    }
    await fetchStatus()
    if (status.value === 'paid' || status.value === 'failed' || Date.now() - startedAt > 120_000) {
      stopPolling()
    }
  }, 3000)
})
onUnmounted(stopPolling)
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-midnight sleep-pattern px-4 py-12">
      <div class="max-w-xl mx-auto text-center">
        <h1 class="font-heading text-3xl sm:text-4xl text-foam leading-tight">
          {{ shop.thanks.heading }}
        </h1>
        <p v-if="orderRef" class="mt-3 text-sm text-lavender/70">
          {{ shop.thanks.orderRefLabel }}: <span class="font-mono text-lavender">{{ displayOrderId }}</span>
        </p>
      </div>
    </div>

    <div class="max-w-xl mx-auto px-4 py-10 text-center space-y-6">

      <!-- Paid: unmissable green confirmation -->
      <div v-if="status === 'paid'" class="bg-success/10 border border-success/25 rounded-xl px-5 py-6 space-y-3">
        <div class="w-14 h-14 rounded-full bg-success flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p class="text-sm text-midnight leading-relaxed font-medium">{{ shop.thanks.paid }}</p>
      </div>

      <!-- Waiting (shown immediately, incl. the first check): spinner + honest copy -->
      <div v-else-if="status === 'loading' || status === 'pending' || status === 'unknown'" class="bg-foam border border-lavender/30 rounded-xl px-5 py-5 space-y-3">
        <span class="inline-block w-6 h-6 border-[3px] border-lavender border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p class="text-sm text-midnight leading-relaxed">{{ shop.thanks.pending }}</p>
      </div>

      <div v-else class="bg-foam border border-red-200 rounded-xl px-5 py-4">
        <p class="text-sm text-midnight leading-relaxed">{{ shop.thanks.failed }}</p>
      </div>

      <!-- Order summary (items + total + delivery) -->
      <div
        v-if="order && status !== 'failed'"
        class="bg-foam rounded-xl border border-lavender/25 text-left overflow-hidden"
      >
        <p class="px-4 pt-3 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
          {{ shop.thanks.summaryHeading }}
        </p>
        <div class="divide-y divide-lavender/15">
          <div
            v-for="item in order.items"
            :key="item.name"
            class="flex items-center justify-between px-4 py-2.5"
          >
            <span class="text-sm text-midnight">{{ item.name }} × {{ item.qty }}</span>
            <span class="text-sm font-semibold text-midnight tabular-nums">{{ eur(item.price * item.qty) }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-2.5 bg-moonlight/50">
            <span class="text-sm font-semibold text-midnight">{{ shop.thanks.totalLabel }}</span>
            <span class="font-heading text-lg text-midnight tabular-nums">{{ eur(order.total) }}</span>
          </div>
          <div v-if="order.terminalName" class="flex items-center justify-between px-4 py-2.5">
            <span class="text-sm text-muted">{{ shop.thanks.deliveryLabel }}</span>
            <span class="text-sm text-midnight text-right">
              {{ order.terminalName }}
              <span class="text-muted">({{ carrierNames[order.shipMethod] ?? order.shipMethod }})</span>
            </span>
          </div>
        </div>
      </div>

      <p v-if="status === 'paid'" class="text-xs text-muted">{{ shop.thanks.emailNote }}</p>

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
