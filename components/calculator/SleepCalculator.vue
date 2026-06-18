<script setup lang="ts">
import { calculator, common } from '~/utils/copy'
import type { SleepIssue } from '~/types'

const {
  step,
  answers,
  result,
  selectOption,
  toggleIssue,
  submitIssues,
  goBack,
  reset,
} = useCalculator()

// Track direction so transitions go the right way
const goingForward = ref(true)
watch(step, (next, prev) => {
  goingForward.value = next > prev
}, { flush: 'sync' })

const transitionName = computed(() =>
  goingForward.value ? 'slide-left' : 'slide-right',
)

// Map step index (1-4) to the answer key
const stepKeys = ['position', 'temp', 'loft', 'partner'] as const

const currentStepData = computed(() => calculator.steps[step.value - 1])

const currentAnswer = computed<string | undefined>(() => {
  if (step.value >= 1 && step.value <= 4) {
    const key = stepKeys[step.value - 1]
    return answers.value[key] as string | undefined
  }
  return undefined
})

function handleSelect(value: string) {
  const key = stepKeys[step.value - 1]
  selectOption(key, value)
}

// Step 5 helpers
const step5Data = computed(() => calculator.steps[4] as typeof calculator.steps[4] & { submitLabel: string })

function isIssueSelected(value: string): boolean {
  const issues = answers.value.issues
  // undefined = user hasn't touched step 5 yet; show nothing as selected
  if (issues === undefined) return false
  if (value === 'none') return issues.length === 0
  return issues.includes(value as SleepIssue)
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="bg-foam rounded-2xl shadow-lg overflow-hidden">

      <!-- Progress bar (steps 1–5 only) -->
      <div
        v-if="step <= 5"
        class="flex items-center justify-between px-5 pt-4 pb-0"
      >
        <!-- Back button -->
        <button
          v-if="step > 1"
          type="button"
          class="flex items-center gap-1 text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded px-1 py-0.5"
          :aria-label="`Mine samm ${step - 1} juurde`"
          @click="goBack"
        >
          <span aria-hidden="true">←</span>
          <span>{{ common.back }}</span>
        </button>
        <span v-else class="w-14" aria-hidden="true" />

        <!-- Progress dots -->
        <div
          class="flex items-center gap-1.5"
          role="progressbar"
          :aria-valuenow="step"
          aria-valuemin="1"
          aria-valuemax="5"
          :aria-label="calculator.progressLabel(step, 5)"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="rounded-full transition-all duration-300"
            :class="{
              'w-2.5 h-2.5 bg-midnight': step === i,
              'w-2 h-2 bg-midnight/60': step > i,
              'w-2 h-2 bg-gray-300': step < i,
            }"
          />
        </div>

        <!-- Step counter -->
        <span class="text-xs text-muted w-14 text-right tabular-nums" aria-hidden="true">
          {{ step }} / 5
        </span>
      </div>

      <!-- Content area -->
      <div class="px-5 pb-6 pt-3">
        <Transition :name="transitionName" mode="out-in">
          <div :key="step">

            <!-- Steps 1–4: single-select -->
            <CalculatorStep
              v-if="step >= 1 && step <= 4"
              :question="currentStepData.question"
              :options="(currentStepData.options as any)"
              :selected="currentAnswer"
              @select="handleSelect"
            />

            <!-- Step 5: multi-select issues -->
            <div v-else-if="step === 5" class="py-2 space-y-5">
              <h2 class="font-serif text-2xl md:text-3xl text-midnight text-center leading-tight">
                {{ step5Data.question }}
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  v-for="opt in step5Data.options"
                  :key="opt.value"
                  type="button"
                  :aria-pressed="isIssueSelected(opt.value)"
                  class="flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2 cursor-pointer"
                  :class="isIssueSelected(opt.value)
                    ? 'bg-midnight border-midnight text-foam'
                    : 'bg-foam border-gray-200 text-midnight hover:border-lavender hover:bg-moonlight active:scale-95'"
                  @click="toggleIssue(opt.value as any)"
                >
                  <span class="text-2xl leading-none select-none" aria-hidden="true">{{ opt.emoji }}</span>
                  <span class="text-sm font-medium leading-tight">{{ opt.label }}</span>
                </button>
              </div>

              <button
                type="button"
                class="w-full bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                @click="submitIssues"
              >
                {{ step5Data.submitLabel }}
              </button>
            </div>

            <!-- Step 6: result -->
            <CalculatorResult
              v-else-if="step === 6 && result"
              :result="result"
              @reset="reset"
            />

          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>
