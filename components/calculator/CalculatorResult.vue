<script setup lang="ts">
import type { CalculatorResult, CalcType } from '~/types'
import { calculator } from '~/utils/copy'

const props = defineProps<{
  result: CalculatorResult
  calcType: CalcType
}>()

const heading = computed(() => calculator.result.resultHeadings[props.calcType])
const mainRec = computed(() => props.result.recommendations[0])

const mounted = ref(false)
onMounted(() => { setTimeout(() => { mounted.value = true }, 50) })
</script>

<template>
  <div class="py-2 space-y-6">

    <!-- Good shape banner -->
    <div
      v-if="result.noUrgentNeed"
      class="flex items-start gap-2.5 bg-success/10 border border-success/25 rounded-xl px-4 py-3"
    >
      <span class="text-success font-bold shrink-0 mt-0.5">✓</span>
      <p class="text-sm text-midnight leading-snug">
        <strong class="font-semibold">Sinu praegune olukord on hea.</strong>
        {{ calculator.result.noUrgentNeedMessage }}
      </p>
    </div>

    <!-- Score comparison -->
    <div class="bg-midnight rounded-xl p-5 text-foam">
      <h2 class="font-heading text-xl mb-4 text-center text-gold">Sinu uneskoor</h2>
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
    <div v-if="mainRec">
      <h3 class="font-heading text-lg text-midnight mb-2">{{ heading }}</h3>
      <div class="bg-dusk rounded-xl p-4 text-foam">
        <div class="flex items-start justify-between gap-2 mb-1">
          <span class="font-semibold text-base leading-snug">{{ mainRec.name }}</span>
          <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="mainRec.urgency === 'must-have'
              ? 'bg-gold text-midnight'
              : 'border border-muted/40 text-muted'"
          >
            {{ mainRec.urgency === 'must-have'
              ? calculator.result.mustHaveBadge
              : calculator.result.niceToHaveBadge }}
          </span>
        </div>
        <p class="text-sm text-foam/85 leading-relaxed mb-3">{{ mainRec.reason }}</p>
        <div class="flex items-center justify-between">
          <span v-if="mainRec.priceText" class="font-semibold text-gold text-base">{{ mainRec.priceText }}</span>
          <a
            v-if="mainRec.linkUrl && mainRec.linkUrl !== '#'"
            :href="mainRec.linkUrl"
            target="_blank"
            rel="noopener"
            class="text-xs font-medium text-gold hover:underline"
          >
            Vaata toodet →
          </a>
        </div>
      </div>
    </div>

    <!-- No product yet (mattress placeholder) -->
    <div v-else class="bg-dusk/40 rounded-xl p-4 border border-dashed border-lavender/30">
      <h3 class="font-heading text-lg text-midnight mb-1">{{ heading }}</h3>
      <p class="text-sm text-muted">Madratsid on varsti poes saadaval — senikaua vaata muid soovitusi.</p>
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

    <!-- CTA to shop -->
    <NuxtLink
      to="/pood"
      class="block w-full text-center bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      {{ calculator.result.ctaButton }}
    </NuxtLink>

    <!-- Research trust note -->
    <p class="text-center text-[11px] text-muted/60 flex items-center justify-center gap-1.5">
      <span aria-hidden="true">🔬</span>{{ calculator.researchResultNote }}
    </p>

  </div>
</template>
