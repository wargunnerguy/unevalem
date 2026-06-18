<script setup lang="ts">
import type { CalculatorResult } from '~/types'
import { calculator } from '~/utils/copy'

const props = defineProps<{
  result: CalculatorResult
}>()

const emit = defineEmits<{
  reset: []
}>()

// Animate bars on mount
const mounted = ref(false)
onMounted(() => {
  setTimeout(() => { mounted.value = true }, 50)
})
</script>

<template>
  <div class="py-2 space-y-6">

    <!-- Score comparison -->
    <div class="bg-midnight rounded-xl p-5 text-foam">
      <h2 class="font-serif text-xl mb-4 text-center">Sinu uneskoor</h2>

      <div class="space-y-4">
        <div>
          <div class="flex justify-between items-baseline mb-1.5 text-sm">
            <span class="text-lavender">{{ calculator.result.currentScoreLabel }}</span>
            <span class="font-semibold tabular-nums">
              {{ result.currentScore }}<span class="text-muted text-xs font-normal"> /100</span>
            </span>
          </div>
          <div class="h-2.5 bg-dusk rounded-full overflow-hidden">
            <div
              class="h-full bg-muted rounded-full transition-all duration-700 ease-out"
              :style="{ width: mounted ? result.currentScore + '%' : '0%' }"
            />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-baseline mb-1.5 text-sm">
            <span class="text-success">{{ calculator.result.improvedScoreLabel }}</span>
            <span class="font-semibold text-success tabular-nums">
              {{ result.improvedScore }}<span class="text-muted text-xs font-normal"> /100</span>
            </span>
          </div>
          <div class="h-2.5 bg-dusk rounded-full overflow-hidden">
            <div
              class="h-full bg-success rounded-full transition-all duration-700 ease-out delay-150"
              :style="{ width: mounted ? result.improvedScore + '%' : '0%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div>
      <h3 class="font-serif text-lg text-midnight mb-3">
        {{ calculator.result.recommendationsHeading }}
      </h3>
      <div class="space-y-3">
        <div
          v-for="rec in result.recommendations"
          :key="rec.id"
          class="bg-dusk rounded-xl p-4 text-foam"
        >
          <div class="flex items-start justify-between gap-2 mb-1">
            <span class="font-semibold text-sm leading-snug">{{ rec.name }}</span>
            <span
              class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
              :class="rec.urgency === 'must-have'
                ? 'bg-gold text-midnight'
                : 'border border-muted/40 text-muted'"
            >
              {{ rec.urgency === 'must-have'
                ? calculator.result.mustHaveBadge
                : calculator.result.niceToHaveBadge }}
            </span>
          </div>
          <p class="text-sm text-lavender leading-relaxed">{{ rec.reason }}</p>
          <a
            v-if="rec.linkUrl && rec.linkUrl !== '#'"
            :href="rec.linkUrl"
            target="_blank"
            rel="noopener"
            class="inline-block mt-2 text-xs font-medium text-gold hover:underline"
          >
            Vaata toodet →
          </a>
        </div>
      </div>
    </div>

    <!-- Personal tips -->
    <div>
      <h3 class="font-serif text-lg text-midnight mb-3">
        {{ calculator.result.tipsHeading }}
      </h3>
      <ul class="space-y-2.5">
        <li
          v-for="(tip, i) in result.personalTips"
          :key="i"
          class="flex gap-3 text-sm text-midnight leading-relaxed"
        >
          <span class="text-success shrink-0 mt-0.5 font-semibold">✓</span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </div>

    <!-- CTA -->
    <a
      href="#"
      class="block w-full text-center bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      {{ calculator.result.ctaButton }}
    </a>

    <!-- Reset -->
    <button
      type="button"
      class="block w-full text-center text-muted text-sm py-1 hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
      @click="emit('reset')"
    >
      {{ calculator.result.resetButton }}
    </button>

  </div>
</template>
