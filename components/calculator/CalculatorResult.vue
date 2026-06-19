<script setup lang="ts">
import type { CalculatorResult, ProductRec } from '~/types'
import { calculator } from '~/utils/copy'

const props = defineProps<{
  result: CalculatorResult
  variant?: string
}>()

const emit = defineEmits<{
  reset: []
}>()

// Variant determines which product is shown first
const blanketFirst = computed(() => props.variant === 'blanket')

const primaryRec = computed<ProductRec | undefined>(() =>
  blanketFirst.value
    ? props.result.recommendations.find(r => r.category === 'blanket')
    : props.result.recommendations.find(r => r.category === 'pillow'),
)
const secondaryRec = computed<ProductRec | undefined>(() =>
  blanketFirst.value
    ? props.result.recommendations.find(r => r.category === 'pillow')
    : props.result.recommendations.find(r => r.category === 'blanket'),
)
const primaryHeading = computed(() =>
  blanketFirst.value ? calculator.result.blanketHeading : calculator.result.pillowHeading,
)
const secondaryHeading = computed(() =>
  blanketFirst.value ? calculator.result.pillowHeading : calculator.result.blanketHeading,
)

// Sleep variant: score is the hero — show it more prominently
const sleepVariant = computed(() => props.variant === 'sleep')

const mounted = ref(false)
onMounted(() => { setTimeout(() => { mounted.value = true }, 50) })
</script>

<template>
  <div class="py-2 space-y-6">

    <!-- Score comparison — expanded for sleep variant -->
    <div class="bg-midnight rounded-xl p-5 text-foam">
      <h2 class="font-heading mb-4 text-center" :class="sleepVariant ? 'text-2xl' : 'text-xl'">
        Sinu uneskoor
      </h2>

      <div v-if="sleepVariant" class="text-center mb-4">
        <span class="font-heading text-5xl text-success tabular-nums">{{ result.improvedScore }}</span>
        <span class="text-muted text-sm"> / 100</span>
        <p class="text-xs text-lavender mt-1">{{ calculator.result.improvedScoreLabel }}</p>
      </div>

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

    <!-- Primary recommendation -->
    <div v-if="primaryRec">
      <h3 class="font-heading text-lg text-midnight mb-2">{{ primaryHeading }}</h3>
      <div class="bg-dusk rounded-xl p-4 text-foam">
        <div class="flex items-start justify-between gap-2 mb-1">
          <span class="font-semibold text-base leading-snug">{{ primaryRec.name }}</span>
          <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gold text-midnight">
            {{ calculator.result.mustHaveBadge }}
          </span>
        </div>
        <p class="text-sm text-lavender leading-relaxed mb-3">{{ primaryRec.reason }}</p>
        <div class="flex items-center justify-between">
          <span v-if="primaryRec.priceText" class="font-semibold text-gold text-base">{{ primaryRec.priceText }}</span>
          <a
            v-if="primaryRec.linkUrl && primaryRec.linkUrl !== '#'"
            :href="primaryRec.linkUrl"
            target="_blank"
            rel="noopener"
            class="text-xs font-medium text-gold hover:underline"
          >
            Vaata toodet →
          </a>
        </div>
      </div>
    </div>

    <!-- Secondary recommendation -->
    <div v-if="secondaryRec">
      <h3 class="font-heading text-lg text-midnight mb-2">{{ secondaryHeading }}</h3>
      <div class="bg-dusk rounded-xl p-4 text-foam">
        <div class="flex items-start justify-between gap-2 mb-1">
          <span class="font-semibold text-base leading-snug">{{ secondaryRec.name }}</span>
          <span
            class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
            :class="secondaryRec.urgency === 'must-have'
              ? 'bg-gold text-midnight'
              : 'border border-muted/40 text-muted'"
          >
            {{ secondaryRec.urgency === 'must-have'
              ? calculator.result.mustHaveBadge
              : calculator.result.niceToHaveBadge }}
          </span>
        </div>
        <p class="text-sm text-lavender leading-relaxed mb-3">{{ secondaryRec.reason }}</p>
        <div class="flex items-center justify-between">
          <span v-if="secondaryRec.priceText" class="font-semibold text-gold text-base">{{ secondaryRec.priceText }}</span>
          <a
            v-if="secondaryRec.linkUrl && secondaryRec.linkUrl !== '#'"
            :href="secondaryRec.linkUrl"
            target="_blank"
            rel="noopener"
            class="text-xs font-medium text-gold hover:underline"
          >
            Vaata toodet →
          </a>
        </div>
      </div>
    </div>

    <!-- Personal tips -->
    <div>
      <h3 class="font-heading text-lg text-midnight mb-3">{{ calculator.result.tipsHeading }}</h3>
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

    <!-- Explore more -->
    <div class="pt-2 border-t border-gray-100">
      <h3 class="font-heading text-base text-midnight mb-3">{{ calculator.result.exploreHeading }}</h3>
      <div class="grid grid-cols-2 gap-3">
        <component
          :is="item.disabled ? 'div' : 'NuxtLink'"
          v-for="item in calculator.result.exploreItems"
          :key="item.label"
          :to="item.disabled ? undefined : item.href"
          class="rounded-xl border p-3 text-left transition-all"
          :class="item.disabled
            ? 'border-dashed border-gray-200 bg-moonlight cursor-default'
            : 'border-lavender/30 bg-foam hover:border-lavender hover:shadow-sm cursor-pointer'"
        >
          <p class="text-sm font-medium text-midnight leading-snug">{{ item.label }}</p>
          <p class="text-xs text-muted mt-0.5">{{ item.hint }}</p>
        </component>
      </div>
    </div>

    <!-- Main CTA -->
    <NuxtLink
      to="/pood"
      class="block w-full text-center bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      {{ calculator.result.ctaButton }}
    </NuxtLink>

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
