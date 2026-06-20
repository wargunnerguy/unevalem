<script setup lang="ts">
import { socialProof, common } from '~/utils/copy'

const { current, visible, showNext, hide } = useNotifications()
const { step } = useCalculator()
const { width } = useWindowSize()

// On mobile, suppress while the calculator is mid-flow (steps 1–10)
const suppressed = computed(
  () => width.value > 0 && width.value < 640 && step.value >= 1 && step.value <= 5,
)

const shouldShow = computed(() => visible.value && !suppressed.value)

const icon = computed(() =>
  current.value ? socialProof.typeIcons[current.value.type] : '',
)

// Social proof should always feel live, so we don't show the real (possibly
// stale) baked-in timestamp. Instead each toast gets a fresh recent time,
// heavily weighted toward "just now" and capped at ~2 hours, so visitors feel
// purchases & calculations are happening right now — never "11 tundi tagasi".
const MAX_AGO_MINUTES = 120

function randomRecentLabel(): string {
  // r² bias → most values tiny, occasionally up toward the 2 h cap
  const r = Math.random()
  const mins = Math.floor(r * r * MAX_AGO_MINUTES)
  if (mins < 5)  return common.justNow
  if (mins < 60) return `${mins} ${common.minutesAgo}`
  const hours = Math.round(mins / 60)
  return `${hours} ${common.hoursAgo}`
}

// Recomputed whenever a new toast is shown (see schedule()).
const relativeLabel = ref('')

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function schedule(firstShow = false) {
  const delay = firstShow
    ? 4_000 + Math.random() * 2_000    // 4–6 s initial delay
    : 15_000 + Math.random() * 10_000  // 15–25 s between shows
  showTimer = setTimeout(() => {
    if (showNext()) {
      relativeLabel.value = randomRecentLabel()
      hideTimer = setTimeout(() => {
        hide()
        schedule()
      }, 6_000)
    } else {
      // No active notifications yet (sheet not populated) — retry later
      schedule()
    }
  }, delay)
}

onMounted(() => schedule(true))

onUnmounted(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="shouldShow && current"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="fixed bottom-4 left-4 z-50 w-[280px] bg-dusk rounded-xl shadow-lg shadow-midnight/30 pointer-events-none select-none"
      >
        <div class="flex items-start gap-3 p-3.5">
          <span class="text-xl shrink-0 mt-0.5" aria-hidden="true">{{ icon }}</span>
          <div class="min-w-0">
            <p class="text-sm text-foam leading-snug">{{ current.text }}</p>
            <p class="text-xs text-muted mt-0.5">{{ relativeLabel }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
