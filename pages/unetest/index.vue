<script setup lang="ts">
import { quizPage, common } from '~/utils/copy'

useHead({
  title: quizPage.metaTitle,
  meta: [
    { name: 'description', content: quizPage.metaDescription },
    { property: 'og:title', content: quizPage.metaTitle },
    { property: 'og:description', content: quizPage.metaDescription },
  ],
})

const { quiz, pending } = useQuiz()

type Phase = 'intro' | 'quiz' | 'result'
const phase = ref<Phase>('intro')
const qIndex = ref(0)
const scores = ref<number[]>([])
const answered = ref<boolean[]>([])
const transitionName = ref('slide-left')

const totalQuestions = computed(() => quiz.value?.questions.length ?? 0)

const totalScore = computed(() =>
  scores.value.reduce((sum, s, i) => sum + (answered.value[i] ? s : 0), 0),
)

// Results are sorted highest-band-first at build time; pick the band the score falls in
const result = computed(() => {
  const rs = quiz.value?.results ?? []
  if (!rs.length) return null
  const s = totalScore.value
  return rs.find(r => s >= r.minScore && s <= r.maxScore) ?? rs[rs.length - 1]
})

const currentQuestion = computed(() => quiz.value?.questions[qIndex.value] ?? null)

const progress = computed(() =>
  totalQuestions.value
    ? Math.round((answered.value.filter(Boolean).length / totalQuestions.value) * 100)
    : 0,
)

function startQuiz() {
  scores.value = Array(totalQuestions.value).fill(0)
  answered.value = Array(totalQuestions.value).fill(false)
  qIndex.value = 0
  transitionName.value = 'slide-left'
  phase.value = 'quiz'
}

function selectAnswer(score: number) {
  scores.value[qIndex.value] = score
  answered.value[qIndex.value] = true
  transitionName.value = 'slide-left'
  if (qIndex.value < totalQuestions.value - 1) {
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
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">
          {{ quizPage.heading }}
        </h1>
      </div>
    </div>

    <!-- Quiz area -->
    <div class="max-w-2xl mx-auto px-4 py-10">

      <!-- Loading / empty states -->
      <p v-if="!quiz && pending" class="text-muted text-center py-10">{{ quizPage.loading }}</p>
      <p v-else-if="!quiz" class="text-muted text-center py-10">{{ quizPage.empty }}</p>

      <Transition v-else :name="transitionName" mode="out-in">
        <div :key="screenKey">

          <!-- ─── INTRO ─────────────────────────────────────────────── -->
          <div v-if="phase === 'intro'" class="bg-foam rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <p class="text-xs font-semibold text-lavender uppercase tracking-wider mb-3">
              {{ quizPage.eyebrow }}
            </p>
            <h2 class="font-heading text-2xl sm:text-3xl text-midnight mb-4 leading-snug">
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
              {{ quizPage.startButton }}
            </button>
          </div>

          <!-- ─── QUIZ ──────────────────────────────────────────────── -->
          <div v-else-if="phase === 'quiz' && currentQuestion">
            <div class="flex items-center gap-3 mb-6">
              <button
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

            <div class="w-full h-1.5 bg-lavender/20 rounded-full mb-8 overflow-hidden">
              <div
                class="h-full bg-lavender rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              />
            </div>

            <div class="bg-foam rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <p class="font-heading text-xl sm:text-2xl text-midnight mb-6 leading-snug">
                {{ currentQuestion.question }}
              </p>
              <div class="flex flex-col gap-3">
                <button
                  v-for="opt in currentQuestion.options"
                  :key="opt.label"
                  type="button"
                  class="w-full text-left px-4 py-3.5 rounded-xl border-2 text-midnight font-medium text-sm sm:text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender"
                  :class="
                    answered[qIndex] && scores[qIndex] === opt.value
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
          <div v-else-if="phase === 'result' && result">
            <button
              type="button"
              class="text-sm text-muted hover:text-midnight transition-colors mb-6 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender rounded"
              @click="goBack"
            >
              ← {{ common.back }}
            </button>

            <div class="bg-dusk rounded-2xl p-6 sm:p-8 mb-4 text-center">
              <p class="text-xs font-semibold text-lavender uppercase tracking-wider mb-3">
                {{ quizPage.resultLabel }}
              </p>
              <h2 class="font-heading text-3xl sm:text-4xl text-foam mb-4">
                {{ result.type }}
              </h2>
              <p class="text-foam/80 leading-relaxed text-sm sm:text-base max-w-lg mx-auto">
                {{ result.description }}
              </p>
            </div>

            <div class="bg-foam rounded-2xl p-6 sm:p-8 border border-gray-100 mb-6">
              <h3 class="font-heading text-xl text-midnight mb-4">{{ quiz.tipsHeading }}</h3>
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
                {{ quizPage.restartButton }}
              </button>
            </div>
          </div>

        </div>
      </Transition>
    </div>

  </div>
</template>
