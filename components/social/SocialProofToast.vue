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

function formatRelativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMins = Math.round(diffMs / 60_000)
  if (diffMins < 5)  return common.justNow
  if (diffMins < 60) return `${diffMins} ${common.minutesAgo}`
  const diffHours = Math.round(diffMs / 3_600_000)
  if (diffHours < 48) return `${diffHours} ${common.hoursAgo}`
  return `${Math.floor(diffHours / 24)} ${common.daysAgo}`
}

const relativeLabel = computed(() =>
  current.value ? formatRelativeTime(current.value.timestamp) : '',
)

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function schedule(firstShow = false) {
  const delay = firstShow
    ? 4_000 + Math.random() * 2_000    // 4–6 s initial delay
    : 15_000 + Math.random() * 10_000  // 15–25 s between shows
  showTimer = setTimeout(() => {
    if (showNext()) {
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
