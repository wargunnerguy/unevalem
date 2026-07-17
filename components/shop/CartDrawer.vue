<script setup lang="ts">
import { shop } from '~/utils/copy'

const { lines, count, subtotalText, isOpen, setQty, remove, close } = useCart()

function lineTotal(price: number, qty: number): string {
  return `${(price * qty).toFixed(2).replace('.', ',')} €`
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-midnight/50 z-40"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <aside
        v-if="isOpen"
        class="fixed top-0 right-0 h-full w-full max-w-sm bg-moonlight z-50 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        :aria-label="shop.cart.heading"
      >
        <div class="flex items-center justify-between px-5 py-4 bg-midnight">
          <h2 class="font-heading text-xl text-foam">{{ shop.cart.heading }}</h2>
          <button
            type="button"
            class="text-lavender hover:text-foam transition-colors text-lg leading-none p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
            :aria-label="shop.cart.close"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="!count" class="flex-1 flex flex-col items-center justify-center gap-3 px-6">
          <p class="text-sm text-muted">{{ shop.cart.empty }}</p>
          <NuxtLink
            to="/pood"
            class="text-sm font-semibold text-midnight border-b border-midnight/30 hover:border-midnight pb-0.5"
            @click="close"
          >
            {{ shop.cart.emptyCta }}
          </NuxtLink>
        </div>

        <!-- Lines -->
        <div v-else class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div
            v-for="line in lines"
            :key="line.id"
            class="flex gap-3 bg-foam rounded-xl border border-lavender/20 p-3"
          >
            <div class="w-14 h-14 rounded-lg bg-gradient-to-br from-midnight to-dusk shrink-0 overflow-hidden flex items-center justify-center">
              <img v-if="line.product.imageUrl" :src="line.product.imageUrl" :alt="line.product.name" class="w-full h-full object-cover" />
              <span v-else class="text-xl opacity-20" aria-hidden="true">🛏️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-midnight leading-snug truncate">{{ line.product.name }}</p>
              <p class="text-xs text-muted mt-0.5">{{ line.product.priceText }}</p>
              <div class="flex items-center justify-between mt-2">
                <div class="flex items-center gap-2">
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
                <span class="text-sm font-semibold text-midnight tabular-nums">{{ lineTotal(line.product.price, line.qty) }}</span>
              </div>
            </div>
            <button
              type="button"
              class="self-start text-muted hover:text-midnight text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              :aria-label="`${shop.cart.remove}: ${line.product.name}`"
              @click="remove(line.id)"
            >✕</button>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="count" class="border-t border-lavender/25 px-5 py-4 space-y-3 bg-foam">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted">{{ shop.cart.subtotal }}</span>
            <span class="font-heading text-lg text-midnight tabular-nums">{{ subtotalText }}</span>
          </div>
          <NuxtLink
            to="/kassa"
            class="block w-full text-center bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            @click="close"
          >
            {{ shop.cart.checkout }}
          </NuxtLink>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
