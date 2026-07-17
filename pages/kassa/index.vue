<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { ParcelTerminal, ShippingMethod } from '~/types'
import { shop } from '~/utils/copy'

useHead({
  title: shop.checkout.metaTitle,
  meta: [{ name: 'robots', content: 'noindex' }],
})

const { lines, count, subtotalText, setQty, remove } = useCart()

// Maksekeskus cancel_url lands here with ?makse=katkes. Shown once, then the
// query is stripped so the notice doesn't reappear on refresh/return visits.
const route = useRoute()
const router = useRouter()
const paymentCancelled = ref(false)
onMounted(() => {
  // The static build's URL query can lag hydration by a moment (same trap as
  // /aitah), so check a few times before concluding there was no cancel.
  const check = () => {
    const cancelled = route.query.makse === 'katkes'
      || new URLSearchParams(window.location.search).get('makse') === 'katkes'
    if (cancelled) {
      paymentCancelled.value = true
      router.replace({ query: {} })
    }
    return cancelled
  }
  if (!check()) {
    setTimeout(check, 300)
    setTimeout(() => { if (!paymentCancelled.value) check() }, 1500)
  }
})

const { data: terminalsData } = useFetch<ParcelTerminal[]>('/api/terminals', {
  default: () => [] as ParcelTerminal[],
})

// Carriers on offer = those actually present in terminals.json
const carriers = computed<ShippingMethod[]>(() => {
  const present = new Set((terminalsData.value ?? []).map(t => t.carrier))
  return (['omniva', 'smartpost'] as const).filter(c => present.has(c))
})

// Persisted locally so navigating away (or a cancelled payment) never loses
// what the buyer already typed. Lives only in their browser.
const form = useStorage('uva-checkout', {
  name: '',
  email: '',
  phone: '',
  carrier: '' as ShippingMethod | '',
  terminalId: '',
  note: '',
})

watch(carriers, (c) => {
  if (!form.value.carrier && c.length) form.value.carrier = c[0]
}, { immediate: true })
watch(() => form.value.carrier, (_, prev) => {
  // Only reset the terminal on an actual carrier switch, not on page load
  if (prev) form.value.terminalId = ''
})

const terminalOptions = computed(() =>
  (terminalsData.value ?? []).filter(t => t.carrier === form.value.carrier),
)

const state = ref<'idle' | 'submitting' | 'error'>('idle')
const errorMsg = ref('')

const valid = computed(() =>
  form.value.name.trim().length > 1
  && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email.trim())
  && form.value.phone.trim().length >= 5
  && !!form.value.carrier
  && !!form.value.terminalId,
)

onMounted(() => {
  if (count.value) gaEvent('checkout_started', { items: count.value })
})

async function submit() {
  if (!count.value) return
  if (!valid.value) {
    errorMsg.value = shop.checkout.required
    return
  }
  errorMsg.value = ''
  state.value = 'submitting'

  const url = useRuntimeConfig().public.sheetsApiUrl as string
  const terminal = terminalOptions.value.find(t => t.id === form.value.terminalId)

  // Only ids + quantities go up — the Apps Script looks prices up from the
  // inventory sheet itself, so a tampered client can't set its own prices.
  const payload = {
    action: 'create_order',
    items: lines.value.map(l => ({ id: l.id, qty: l.qty })),
    customer: {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
    },
    shipping: {
      method: form.value.carrier,
      terminalId: form.value.terminalId,
      terminalName: terminal?.name ?? '',
    },
    note: form.value.note.trim(),
  }

  try {
    // create_order needs the response (payment URL), so no-cors won't do.
    // Apps Script supports CORS for POST with text/plain content type.
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    })
    const data = await res.json() as { ok?: boolean; orderRef?: string; paymentUrl?: string; error?: string }
    if (!data.ok || !data.paymentUrl) throw new Error(data.error || 'no payment url')

    // Cart is intentionally NOT cleared here: if the payment is cancelled the
    // user returns with their cart intact. /aitah clears it once payment is
    // confirmed.
    gaEvent('purchase_redirect', { order_ref: data.orderRef ?? '' })
    window.location.href = data.paymentUrl
  } catch {
    state.value = 'error'
    errorMsg.value = shop.checkout.error
  }
}
</script>

<template>
  <div class="min-h-screen bg-moonlight">
    <div class="bg-midnight px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="font-heading text-4xl text-foam leading-tight">{{ shop.checkout.heading }}</h1>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-10">

      <!-- Empty cart -->
      <ClientOnly>
        <div v-if="!count" class="text-center py-16 space-y-3">
          <p class="text-muted">{{ shop.checkout.emptyCart }}</p>
          <NuxtLink to="/pood" class="inline-block font-semibold text-midnight border-b border-midnight/30 hover:border-midnight pb-0.5">
            {{ shop.cart.emptyCta }}
          </NuxtLink>
        </div>

        <form v-else class="space-y-8" @submit.prevent="submit">

          <!-- Cancelled payment notice -->
          <div
            v-if="paymentCancelled"
            class="bg-foam border border-red-200 rounded-xl px-4 py-3 text-sm text-midnight leading-snug"
          >
            {{ shop.checkout.cancelledNotice }}
          </div>

          <!-- Order lines -->
          <section>
            <h2 class="font-heading text-xl text-midnight mb-3">{{ shop.checkout.itemsHeading }}</h2>
            <div class="bg-foam rounded-xl border border-lavender/25 divide-y divide-lavender/15">
              <div v-for="line in lines" :key="line.id" class="flex items-center justify-between gap-3 px-4 py-3">
                <span class="text-sm text-midnight flex-1 min-w-0 truncate">{{ line.product.name }}</span>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    class="w-6 h-6 rounded border border-lavender/40 text-midnight text-sm leading-none hover:bg-lavender/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                    :aria-label="`Vähenda kogust: ${line.product.name}`"
                    @click="setQty(line.id, line.qty - 1)"
                  >−</button>
                  <span class="text-sm tabular-nums w-5 text-center">{{ line.qty }}</span>
                  <button
                    type="button"
                    class="w-6 h-6 rounded border border-lavender/40 text-midnight text-sm leading-none hover:bg-lavender/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                    :aria-label="`Suurenda kogust: ${line.product.name}`"
                    @click="setQty(line.id, line.qty + 1)"
                  >+</button>
                </div>
                <span class="text-sm font-semibold text-midnight tabular-nums w-20 text-right shrink-0">
                  {{ (line.product.price * line.qty).toFixed(2).replace('.', ',') }} €
                </span>
                <button
                  type="button"
                  class="shrink-0 text-muted hover:text-midnight text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
                  :aria-label="`${shop.cart.remove}: ${line.product.name}`"
                  @click="remove(line.id)"
                >✕</button>
              </div>
              <div class="flex items-center justify-between px-4 py-3 bg-moonlight/50">
                <span class="text-sm font-semibold text-midnight">{{ shop.cart.subtotal }}</span>
                <span class="font-heading text-lg text-midnight tabular-nums">{{ subtotalText }}</span>
              </div>
            </div>
          </section>

          <!-- Contact -->
          <section class="space-y-4">
            <div>
              <label for="ck-name" class="block text-sm font-medium text-midnight mb-1">{{ shop.checkout.name }} *</label>
              <input id="ck-name" v-model="form.name" type="text" required autocomplete="name"
                class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender" />
            </div>
            <div>
              <label for="ck-email" class="block text-sm font-medium text-midnight mb-1">{{ shop.checkout.email }} *</label>
              <input id="ck-email" v-model="form.email" type="email" required autocomplete="email"
                class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender" />
            </div>
            <div>
              <label for="ck-phone" class="block text-sm font-medium text-midnight mb-1">{{ shop.checkout.phone }} *</label>
              <input id="ck-phone" v-model="form.phone" type="tel" required autocomplete="tel"
                class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender" />
            </div>
          </section>

          <!-- Shipping -->
          <section>
            <h2 class="font-heading text-xl text-midnight mb-3">{{ shop.checkout.shippingHeading }}</h2>

            <div v-if="!terminalsData?.length" class="text-sm text-muted">{{ shop.checkout.terminalLoading }}</div>

            <template v-else>
              <fieldset class="flex gap-3 mb-3">
                <legend class="sr-only">{{ shop.checkout.shippingHeading }}</legend>
                <label
                  v-for="carrier in carriers"
                  :key="carrier"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors"
                  :class="form.carrier === carrier
                    ? 'border-midnight bg-midnight text-foam'
                    : 'border-lavender/40 bg-foam text-midnight hover:border-lavender'"
                >
                  <input v-model="form.carrier" type="radio" name="carrier" :value="carrier" class="sr-only" />
                  {{ shop.checkout.carriers[carrier] }}
                </label>
              </fieldset>

              <label for="ck-terminal" class="block text-sm font-medium text-midnight mb-1">{{ shop.checkout.terminalLabel }} *</label>
              <select
                id="ck-terminal"
                v-model="form.terminalId"
                required
                class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender"
              >
                <option value="" disabled>—</option>
                <option v-for="t in terminalOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </template>
          </section>

          <!-- Note -->
          <section>
            <label for="ck-note" class="block text-sm font-medium text-midnight mb-1">{{ shop.checkout.note }}</label>
            <textarea id="ck-note" v-model="form.note" rows="3"
              class="w-full rounded-lg border border-lavender/40 bg-foam px-3 py-2.5 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-lavender" />
          </section>

          <!-- Submit -->
          <section class="space-y-3">
            <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
            <button
              type="submit"
              :disabled="state === 'submitting'"
              class="w-full bg-gold text-midnight font-semibold py-3.5 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {{ state === 'submitting' ? shop.checkout.submitting : shop.checkout.submit }}
            </button>
            <p class="text-[11px] text-muted/80 leading-snug text-center">
              {{ shop.checkout.gdpr }}
              <NuxtLink to="/privaatsus" class="underline underline-offset-2 hover:text-midnight">{{ shop.notifyGdprLink }}</NuxtLink>
            </p>
          </section>

        </form>
      </ClientOnly>

    </div>
  </div>
</template>
