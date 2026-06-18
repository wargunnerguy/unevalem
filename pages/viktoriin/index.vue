<script setup lang="ts">
import { quizPage, quizzes, common } from '~/utils/copy'

useHead({
  title: quizPage.metaTitle,
  meta: [
    { name: 'description', content: quizPage.metaDescription },
    { property: 'og:title', content: quizPage.metaTitle },
    { property: 'og:description', content: quizPage.metaDescription },
  ],
})

const quiz = quizzes.chronotype
const totalQuestions = quiz.questions.length

// ── State ──────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'quiz' | 'result'
const phase = ref<Phase>('intro')
const qIndex = ref(0)
const scores = ref<number[]>(Array(totalQuestions).fill(0))
const answered = ref<boolean[]>(Array(totalQuestions).fill(false))
const transitionName = ref('slide-left')

// ── Derived ────────────────────────────────────────────────────────────────
const totalScore = computed(() =>
  scores.value.reduce((sum, s, i) => sum + (answered.value[i] ? s : 0), 0),
)

const result = computed(() => {
  const s = totalScore.value
  const r = quiz.results
  if (s >= r.lark.range[0])        return r.lark
  if (s >= r.intermediate.range[0]) return r.intermediate
  return r.owl
})

const currentQuestion = computed(() => quiz.questions[qIndex.value])

const progress = computed(() =>
  Math.round((answered.value.filter(Boolean).length / totalQuestions) * 100),
)

// ── Actions ────────────────────────────────────────────────────────────────
function startQuiz() {
  scores.value = Array(totalQuestions).fill(0)
  answered.value = Array(totalQuestions).fill(false)
  qIndex.value = 0
  transitionName.value = 'slide-left'
  phase.value = 'quiz'
}

function selectAnswer(score: number) {
  scores.value[qIndex.value] = score
  answered.value[qIndex.value] = true
  transitionName.value = 'slide-left'
  if (qIndex.value < totalQuestions - 1) {
    qIndex.value++
  } else {
    phase.value = 'result'
  }
}

function goBack() {
  transitionName.value = 'slide-right'
  if (phase.value === 'result') {
    phase.value = 'quiz'
  } else if (qIndex.value > 0) {
    qIndex.value--
  } else {
    phase.value = 'intro'
  }
}

function restart() {
  transitionName.value = 'slide-right'
  phase.value = 'intro'
}

// ── Computed key for transition ────────────────────────────────────────────
const screenKey = computed(() => {
  if (phase.value === 'intro')  return 'intro'
  if (phase.value === 'result') return 'result'
  return `q-${qIndex.value}`
})
</script>

<template>
  <div class="min-h-screen bg-moonlight">

    <!-- Header -->
    <div class="bg-midnight px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="font-serif text-4xl md:text-5xl text-foam leading-tight">
          {{ quizPage.heading }}
        </h1>
      </div>
    </div>

    <!-- Quiz area -->
    <div class="max-w-2xl mx-auto px-4 py-10">
      <Transition :name="transitionName" mode="out-in">
        <div :key="screenKey">

          <!-- ─── INTRO ─────────────────────────────────────────────── -->
          <div v-if="phase === 'intro'" class="bg-foam rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <p class="text-xs font-semibold text-lavender uppercase tracking-wider mb-3">
              Unviktoriin
            </p>
            <h2 class="font-serif text-2xl sm:text-3xl text-midnight mb-4 leading-snug">
              {{ quiz.title }}
            </h2>
            <p class="text-muted leading-relaxed mb-8">
              {{ quiz.description }}
            </p>
            <button
              type="button"
              class="w-full sm:w-auto px-8 py-3 rounded-xl bg-gold text-midnight font-semibold text-base hover:bg-gold/90 active:scale-[.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              @click="startQuiz"
            >
              Alusta viktoriini →
            </button>
          </div>

          <!-- ─── QUIZ ──────────────────────────────────────────────── -->
          <div v-else-if="phase === 'quiz'">
            <!-- Progress -->
            <div class="flex items-center gap-3 mb-6">
              <button
                v-if="qIndex > 0"
                type="button"
                class="text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
                :aria-label="common.back"
                @click="goBack"
              >
                ← {{ common.back }}
              </button>
              <button
                v-else
                type="button"
                class="text-sm text-muted hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
                :aria-label="common.back"
                @click="goBack"
              >
                ← {{ common.back }}
              </button>
              <div class="flex-1 flex items-center gap-2 justify-end">
                <span class="text-xs text-muted">{{ qIndex + 1 }} / {{ totalQuestions }}</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-lavender/20 rounded-full mb-8 overflow-hidden">
              <div
                class="h-full bg-lavender rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <!-- Question card -->
            <div class="bg-foam rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <p class="font-serif text-xl sm:text-2xl text-midnight mb-6 leading-snug">
                {{ currentQuestion.question }}
              </p>
              <div class="flex flex-col gap-3">
                <button
                  v-for="opt in currentQuestion.options"
                  :key="opt.label"
                  type="button"
                  class="w-full text-left px-4 py-3.5 rounded-xl border-2 text-midnight font-medium text-sm sm:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                  :class="
                    answered.value?.[qIndex] && scores[qIndex] === opt.value
                      ? 'border-lavender bg-lavender/10'
                      : 'border-gray-200 bg-foam hover:border-lavender/60 hover:bg-moonlight active:scale-[.99]'
                  "
                  @click="selectAnswer(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- ─── RESULT ─────────────────────────────────────────────── -->
          <div v-else-if="phase === 'result'">
            <!-- Back -->
            <button
              type="button"
              class="text-sm text-muted hover:text-midnight transition-colors mb-6 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              @click="goBack"
            >
              ← {{ common.back }}
            </button>

            <!-- Result card -->
            <div class="bg-dusk rounded-2xl p-6 sm:p-8 mb-4 text-center">
              <p class="text-xs font-semibold text-lavender uppercase tracking-wider mb-3">
                Sinu tulemus
              </p>
              <h2 class="font-serif text-3xl sm:text-4xl text-foam mb-4">
                {{ result.type }}
              </h2>
              <p class="text-foam/80 leading-relaxed text-sm sm:text-base max-w-lg mx-auto">
                {{ result.description }}
              </p>
            </div>

            <!-- Tips -->
            <div class="bg-foam rounded-2xl p-6 sm:p-8 border border-gray-100 mb-6">
              <h3 class="font-serif text-xl text-midnight mb-4">Nõuanded sinu kronotüübile</h3>
              <ul class="space-y-3">
                <li
                  v-for="(tip, i) in result.tips"
                  :key="i"
                  class="flex items-start gap-3 text-sm text-midnight leading-relaxed"
                >
                  <span class="text-lavender shrink-0 mt-0.5" aria-hidden="true">✦</span>
                  {{ tip }}
                </li>
              </ul>
            </div>

            <!-- CTAs -->
            <div class="flex flex-col sm:flex-row gap-3">
              <NuxtLink
                to="/"
                class="flex-1 text-center px-6 py-3 rounded-xl bg-gold text-midnight font-semibold text-sm hover:bg-gold/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                {{ quizPage.tryCalculator }}
              </NuxtLink>
              <button
                type="button"
                class="flex-1 text-center px-6 py-3 rounded-xl border border-lavender/40 text-muted text-sm font-medium hover:border-lavender hover:text-midnight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                @click="restart"
              >
                Alusta uuesti
              </button>
            </div>
          </div>

        </div>
      </Transition>
    </div>

  </div>
</template>
