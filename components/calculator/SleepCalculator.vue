<script setup lang="ts">
import type { CalcType } from '~/types'
import { calculator, common } from '~/utils/copy'

const calcVersion = calculator.version

const { step, answers, result, analyzing, selectOption, submitQuiz, finishAnalysis, goBack, reset } = useCalculator()
const { products } = useProducts()
const { variant } = useABTest()
const { submitCalcResult, resetSubmitted } = useAnalytics()
const {
  siteProfile, activeCalcType, completedCount, allDone,
  syncActiveCalcType, getNextAfter, storeCompletion, getPrefilledAnswers,
} = useCalcSession()

// Sync active calc type from cookies on mount (avoids SSR mismatch).
// If the type changed (returning visitor who completed a calc), also reset.
onMounted(() => {
  const prevType = activeCalcType.value
  syncActiveCalcType()
  if (activeCalcType.value !== prevType) {
    const prefill = getPrefilledAnswers(activeCalcType.value)
    reset(prefill)
  }
})

const calcConfig = computed(() => calculator.configs[activeCalcType.value])
const stepKeys = computed(() => calcConfig.value.stepKeys as readonly string[])

const currentStepData = computed(() => calcConfig.value.steps[step.value - 1])

const currentAnswer = computed<string | undefined>(() => {
  if (step.value >= 1 && step.value <= 5) {
    const key = stepKeys.value[step.value - 1]
    return (answers.value as Record<string, string>)[key]
  }
  return undefined
})

const timeLeft = computed(() => calculator.timeLeft(step.value))

// The next calc type to offer after this one completes
const nextCalcType = computed(() => getNextAfter(activeCalcType.value))

// Save + submit when result screen appears
watch(step, (val, prev) => {
  if (val === 6 && result.value) {
    const productName = result.value.recommendations[0]?.name ?? ''
    storeCompletion(activeCalcType.value, answers.value, productName)
    submitCalcResult(answers.value, result.value, activeCalcType.value)
  }
  if (val === 1 && prev && prev > 1) resetSubmitted()
})

// Slide direction
const goingForward = ref(true)
watch(step, (next, prev) => { goingForward.value = next > prev }, { flush: 'sync' })
const transitionName = computed(() => goingForward.value ? 'slide-left' : 'slide-right')

function handleSelect(value: string) {
  const key = stepKeys.value[step.value - 1]
  const isLastStep = step.value === 5
  selectOption(key as keyof typeof answers.value, value)
  if (isLastStep) {
    setTimeout(() => submitQuiz(products.value ?? [], activeCalcType.value), 350)
  }
}

function startNextCalc() {
  const next = nextCalcType.value
  if (!next) return
  const prefill = getPrefilledAnswers(next)
  activeCalcType.value = next
  reset(prefill)
}

// ── Analysis stages ───────────────────────────────────────────────────────
interface Stage { text: string; delay: number }
function rnd(min: number, max: number) { return min + Math.floor(Math.random() * (max - min)) }

function buildStages(a: Partial<typeof answers.value>, type: CalcType): Stage[] {
  const stages: Stage[] = []
  stages.push({ text: 'Töötlen sinu vastuseid...', delay: rnd(500, 800) })

  if (type === 'pillow') {
    const posMsg: Record<string, string> = {
      side:    'Analüüsin külilimagaja toevajadusi...',
      back:    'Analüüsin selilimagaja kaela- ja seljatoe nõudeid...',
      stomach: 'Analüüsin kõhulimagaja eripärasid...',
      combo:   'Analüüsin vahelduvate asendite mõju...',
    }
    stages.push({ text: posMsg[a.position ?? ''] ?? 'Analüüsin magamisasendit...', delay: rnd(900, 1400) })
    if (a.neckPain === 'often' || a.neckPain === 'sometimes') {
      stages.push({ text: 'Kontrollin kaelavalude seost patjatüübiga...', delay: rnd(1100, 1600) })
    }
    if (a.allergies && a.allergies !== 'none') {
      stages.push({ text: 'Kontrollin allergeenivabaduse nõudeid...', delay: rnd(900, 1300) })
    }
    stages.push({ text: 'Otsin sobivaimaid padju andmebaasist...', delay: rnd(1600, 2400) })
    if (a.pillowAge === '3y+') {
      stages.push({ text: 'Arvestan praeguse padja kulumisastet...', delay: rnd(700, 1000) })
    }
    stages.push({ text: 'Koostan sinu personaalset padjasoovitust...', delay: rnd(1000, 1500) })
  } else if (type === 'blanket') {
    if (a.sweating === 'often' || a.temp === 'hot') {
      stages.push({ text: 'Arvestan intensiivset ööhigistamist ja termoregulatsiooni...', delay: rnd(1000, 1400) })
    } else {
      stages.push({ text: 'Arvestan temperatuuri- ja mugavuseelistusi...', delay: rnd(700, 1000) })
    }
    if (a.allergies && a.allergies !== 'none') {
      stages.push({ text: 'Kontrollin allergeenivabaduse nõudeid...', delay: rnd(900, 1300) })
    }
    if (a.partner === 'shared') {
      stages.push({ text: 'Arvestan jagatud teki eripärasid...', delay: rnd(800, 1100) })
    }
    stages.push({ text: 'Otsin sobivaimaid tekke andmebaasist...', delay: rnd(1600, 2400) })
    stages.push({ text: 'Koostan sinu personaalset tekisoovitust...', delay: rnd(1000, 1500) })
  } else {
    const posMsg: Record<string, string> = {
      side:    'Analüüsin külilimagaja rõhujaotuse vajadusi...',
      back:    'Analüüsin selilimagaja lülisamba toevajadusi...',
      stomach: 'Analüüsin kõhulimagaja madratsikõvaduse nõudeid...',
      combo:   'Analüüsin vahelduvate asendite mõju...',
    }
    stages.push({ text: posMsg[a.position ?? ''] ?? 'Analüüsin magamisasendit...', delay: rnd(900, 1400) })
    if (a.backPain === 'often' || a.backPain === 'sometimes') {
      stages.push({ text: 'Hindan seljavalu seost madratsitüübiga...', delay: rnd(1100, 1600) })
    }
    stages.push({ text: 'Otsin sobivaimaid madratseid andmebaasist...', delay: rnd(1600, 2400) })
    if ((a.mattressAge as string) === '5y+' || (a.mattressAge as string) === '3-5y') {
      stages.push({ text: 'Arvestan madratsiga seotud riskitegureid...', delay: rnd(800, 1100) })
    }
    stages.push({ text: 'Koostan sinu personaalset madratsitsoovitust...', delay: rnd(1000, 1500) })
  }
  return stages
}

const shownMessages = ref<string[]>([])
const analysisDuration = ref(7000)
const timers: ReturnType<typeof setTimeout>[] = []

watch(analyzing, (val) => {
  if (val) {
    shownMessages.value = []
    timers.forEach(clearTimeout)
    timers.length = 0
    const stages = buildStages(answers.value, activeCalcType.value)
    let elapsed = 0
    stages.forEach((stage) => {
      elapsed += stage.delay
      timers.push(setTimeout(() => { shownMessages.value = [...shownMessages.value, stage.text] }, elapsed))
    })
    const total = elapsed + 600
    analysisDuration.value = total
    timers.push(setTimeout(() => finishAnalysis(), total))
  } else {
    timers.forEach(clearTimeout)
    timers.length = 0
    shownMessages.value = []
  }
})

// Profile progress helpers
function isCalcDone(type: CalcType): boolean {
  return !!siteProfile.value[type]
}
function getProductName(type: CalcType): string {
  return siteProfile.value[type]?.productName ?? ''
}
</script>

<template>
  <div class="w-full max-w-xl mx-auto">
    <div class="bg-foam rounded-2xl shadow-lg overflow-hidden">

      <!-- Calc journey breadcrumb (steps 1–5) -->
      <div v-if="step <= 5 && !analyzing" class="flex items-center justify-center gap-1.5 px-5 pt-4 pb-1 text-[11px]">
        <template v-for="(type, idx) in (['pillow', 'blanket', 'mattress'] as const)" :key="type">
          <span
            class="flex items-center gap-0.5 transition-colors"
            :class="
              type === activeCalcType
                ? 'text-midnight font-semibold'
                : isCalcDone(type)
                ? 'text-success'
                : 'text-gray-300'
            "
          >
            <span v-if="isCalcDone(type) && type !== activeCalcType" aria-hidden="true">✓ </span>
            {{ calculator.configs[type].icon }} {{ calculator.session.doneLabel[type] }}
          </span>
          <span v-if="idx < 2" class="text-gray-200" aria-hidden="true">›</span>
        </template>
      </div>

      <!-- Progress header (steps 1–5 only) -->
      <div
        v-if="step <= 5 && !analyzing"
        class="flex items-center gap-3 px-5 pt-2 pb-0"
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

        <div
          class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          :aria-valuenow="step"
          aria-valuemin="1"
          aria-valuemax="5"
          :aria-label="calculator.progressLabel(step, 5)"
        >
          <div
            class="h-full bg-midnight rounded-full transition-all duration-300"
            :style="{ width: (step / 5 * 100) + '%' }"
          />
        </div>

        <div class="shrink-0 text-right" aria-hidden="true">
          <span class="block text-xs text-midnight/60 tabular-nums">{{ step }} / 5</span>
          <span v-if="timeLeft" class="block text-[10px] text-midnight/40 leading-none mt-0.5">{{ timeLeft }}</span>
        </div>
      </div>

      <!-- Content area -->
      <div class="px-5 pb-6 pt-3">
        <Transition :name="transitionName" mode="out-in">
          <div :key="analyzing ? 'analyzing' : step">

            <!-- Steps 1–5: auto-advance on click -->
            <CalculatorStep
              v-if="step >= 1 && step <= 5 && !analyzing"
              :question="currentStepData.question"
              :options="(currentStepData.options as any)"
              :selected="currentAnswer"
              @select="handleSelect"
            />

            <!-- Analyzing phase -->
            <div v-else-if="analyzing" class="py-6 space-y-5" aria-live="polite">
              <div class="text-center">
                <p class="font-heading text-xl text-midnight mb-1">Analüüsin sinu vastuseid</p>
                <p class="text-xs text-muted">Palun oota hetk...</p>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="analyzing-bar h-full bg-midnight rounded-full"
                  :style="{ animationDuration: analysisDuration + 'ms' }"
                />
              </div>
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

            <!-- Step 6: result + profile progress -->
            <div v-else-if="step === 6 && result">
              <!-- Main result -->
              <CalculatorResult
                :result="result"
                :calc-type="activeCalcType"
              />

              <!-- Profile progress -->
              <div class="border-t border-gray-100 mt-6 pt-5 space-y-4">
                <div>
                  <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                    {{ calculator.session.profileHeading }}
                    <span class="font-normal normal-case ml-1 text-midnight/40">
                      ({{ calculator.session.progressOf(completedCount, 3) }})
                    </span>
                  </p>
                  <div class="space-y-2">
                    <div
                      v-for="type in (['pillow', 'blanket', 'mattress'] as const)"
                      :key="type"
                      class="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        class="text-xs font-bold shrink-0 w-3"
                        :class="isCalcDone(type) ? 'text-success' : 'text-gray-300'"
                      >{{ isCalcDone(type) ? '✓' : '○' }}</span>
                      <span :class="isCalcDone(type) ? 'text-midnight font-medium' : 'text-muted'">
                        {{ calculator.session.doneLabel[type] }}
                      </span>
                      <span v-if="getProductName(type)" class="text-muted text-xs ml-auto truncate max-w-[140px]">
                        {{ getProductName(type) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Next calc CTA -->
                <div v-if="nextCalcType">
                  <p class="text-xs text-muted mb-2">{{ calculator.session.nextCalcLabel[activeCalcType] }}</p>
                  <button
                    type="button"
                    class="w-full bg-gold text-midnight font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    @click="startNextCalc"
                  >
                    {{ calculator.session.nextCalcBtn[activeCalcType] }}
                  </button>
                </div>
                <div v-else class="text-center py-1">
                  <p class="text-sm font-medium text-midnight">🎉 {{ calculator.session.doneAll }}</p>
                </div>

                <button
                  type="button"
                  class="block w-full text-center text-muted text-sm py-1 hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
                  @click="reset()"
                >
                  {{ calculator.session.redoButton }}
                </button>
              </div>
            </div>

          </div>
        </Transition>
      </div>

      <!-- Version stamp -->
      <div class="flex justify-end px-3 pb-1.5 -mt-1">
        <span class="text-[9px] text-midnight/20 select-none tracking-wide">{{ calcVersion }}</span>
      </div>
    </div>
  </div>
</template>
