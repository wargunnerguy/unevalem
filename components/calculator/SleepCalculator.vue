<script setup lang="ts">
import { calculator, common } from '~/utils/copy'

const {
  step,
  answers,
  result,
  analyzing,
  selectOption,
  submitQuiz,
  goBack,
  reset,
} = useCalculator()

const { products } = useProducts()
const { variant } = useABTest()
const { submitCalcResult, resetSubmitted } = useAnalytics()

// Submit + cache when result is ready; guard prevents duplicate fires from HMR re-mounts
watch(step, (val, prev) => {
  if (val === 11 && result.value) {
    submitCalcResult(answers.value, result.value)
    try {
      localStorage.setItem('unevalem-last-calc', JSON.stringify({
        variant:     variant.value,
        completedAt: new Date().toISOString(),
        pillow:      result.value.recommendations.find(r => r.category === 'pillow')?.name ?? '',
        blanket:     result.value.recommendations.find(r => r.category === 'blanket')?.name ?? '',
        score:       result.value.currentScore,
        improved:    result.value.improvedScore,
      }))
    } catch {}
  }
  // Allow re-submission if the user redoes the quiz from scratch
  if (val === 1 && prev && prev > 1) {
    resetSubmitted()
  }
})

const goingForward = ref(true)
watch(step, (next, prev) => {
  goingForward.value = next > prev
}, { flush: 'sync' })

const transitionName = computed(() =>
  goingForward.value ? 'slide-left' : 'slide-right',
)

const stepKeys = [
  'position', 'bodyType', 'neckPain', 'sweating', 'temp',
  'blanketWeight', 'partner', 'allergies', 'pillowAge', 'complaint',
] as const

type StepKey = typeof stepKeys[number]

const currentStepData = computed(() => calculator.steps[step.value - 1])

const currentAnswer = computed<string | undefined>(() => {
  if (step.value >= 1 && step.value <= 10) {
    const key = stepKeys[step.value - 1] as StepKey
    return answers.value[key] as string | undefined
  }
  return undefined
})

const canSubmit = computed(() => !!answers.value.complaint)

const timeLeft = computed(() => calculator.timeLeft(step.value))

function handleSelect(value: string) {
  const key = stepKeys[step.value - 1] as StepKey
  selectOption(key, value)
}

// ── Analyzing screen messages ──────────────────────────────────────────────
const analyzingMessages = [
  'Kontrollin magamisasendit...',
  'Analüüsin kehaehituse andmeid...',
  'Arvestan temperatuurieelistusi...',
  'Valin sobivad tooted...',
  'Koostan sinu isiklikku soovitust...',
]
const shownMessages = ref<string[]>([])
let msgTimer: ReturnType<typeof setInterval> | null = null

watch(analyzing, (val) => {
  if (val) {
    shownMessages.value = []
    let i = 0
    msgTimer = setInterval(() => {
      if (i < analyzingMessages.length) {
        shownMessages.value = [...shownMessages.value, analyzingMessages[i++]]
      } else {
        if (msgTimer) clearInterval(msgTimer)
      }
    }, 1000)
  } else {
    if (msgTimer) { clearInterval(msgTimer); msgTimer = null }
    shownMessages.value = []
  }
})
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="bg-foam rounded-2xl shadow-lg overflow-hidden">

      <!-- Progress header (steps 1–10 only) -->
      <div
        v-if="step <= 10 && !analyzing"
        class="flex items-center gap-3 px-5 pt-4 pb-0"
      >
        <button
          v-if="step > 1"
          type="button"
          class="shrink-0 flex items-center gap-1 text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded px-1 py-0.5"
          :aria-label="`Mine samm ${step - 1} juurde`"
          @click="goBack"
        >
          <span aria-hidden="true">←</span>
          <span>{{ common.back }}</span>
        </button>
        <span v-else class="shrink-0 w-14" aria-hidden="true" />

        <!-- Progress bar -->
        <div
          class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          :aria-valuenow="step"
          aria-valuemin="1"
          aria-valuemax="10"
          :aria-label="calculator.progressLabel(step, 10)"
        >
          <div
            class="h-full bg-midnight rounded-full transition-all duration-300"
            :style="{ width: (step / 10 * 100) + '%' }"
          />
        </div>

        <div class="shrink-0 text-right" aria-hidden="true">
          <span class="block text-xs text-muted tabular-nums">{{ step }} / 10</span>
          <span v-if="timeLeft" class="block text-[10px] text-muted/60 leading-none mt-0.5">{{ timeLeft }}</span>
        </div>
      </div>

      <!-- Content area -->
      <div class="px-5 pb-6 pt-3">
        <Transition :name="transitionName" mode="out-in">
          <div :key="analyzing ? 'analyzing' : step">

            <!-- Steps 1–9: single-select, auto-advance -->
            <CalculatorStep
              v-if="step >= 1 && step <= 9 && !analyzing"
              :question="currentStepData.question"
              :options="(currentStepData.options as any)"
              :selected="currentAnswer"
              @select="handleSelect"
            />

            <!-- Step 10: single-select + explicit submit -->
            <div v-else-if="step === 10 && !analyzing" class="py-2 space-y-6">
              <CalculatorStep
                :question="currentStepData.question"
                :options="(currentStepData.options as any)"
                :selected="currentAnswer"
                @select="handleSelect"
              />

              <button
                type="button"
                :disabled="!canSubmit"
                class="w-full font-semibold py-3 px-6 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                :class="canSubmit
                  ? 'bg-gold text-midnight hover:opacity-90 cursor-pointer'
                  : 'bg-gray-200 text-muted cursor-not-allowed'"
                @click="canSubmit && submitQuiz(products ?? [])"
              >
                {{ (currentStepData as any).submitLabel }}
              </button>
            </div>

            <!-- Analyzing phase -->
            <div v-else-if="analyzing" class="py-6 space-y-5" aria-live="polite">
              <div class="text-center">
                <p class="font-heading text-xl text-midnight mb-1">Analüüsin sinu vastuseid</p>
                <p class="text-xs text-muted">Palun oota hetk...</p>
              </div>

              <!-- Spurt progress bar -->
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="analyzing-bar h-full bg-midnight rounded-full" />
              </div>

              <!-- Messages appearing one by one -->
              <TransitionGroup
                tag="div"
                class="space-y-2.5 min-h-[6rem]"
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <p
                  v-for="msg in shownMessages"
                  :key="msg"
                  class="flex items-center gap-2 text-sm text-muted"
                >
                  <span class="text-success shrink-0 font-bold text-xs">✓</span>
                  {{ msg }}
                </p>
              </TransitionGroup>
            </div>

            <!-- Step 11: result -->
            <CalculatorResult
              v-else-if="step === 11 && result"
              :result="result"
              :variant="variant"
              @reset="reset"
            />

          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>
