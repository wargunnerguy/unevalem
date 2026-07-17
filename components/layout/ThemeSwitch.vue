<script setup lang="ts">
// Slider-style dark mode toggle. The knob position is LOCAL state so the
// slide animation can finish first — the theme flips only after the 300ms
// transition ends. Dark = knob LEFT, and the knob itself carries the
// current-mode glyph (moon when dark), so state reads unambiguously.
const { isDark, setTheme } = useTheme()

const knobDark = ref(isDark.value)
watch(isDark, (v) => { knobDark.value = v })

let pending: ReturnType<typeof setTimeout> | null = null
function onToggle() {
  knobDark.value = !knobDark.value
  if (pending) clearTimeout(pending)
  pending = setTimeout(() => { setTheme(knobDark.value) }, 300)
}
onUnmounted(() => { if (pending) clearTimeout(pending) })
</script>

<template>
  <button
    type="button"
    class="toggle-switch ml-1 shrink-0"
    role="switch"
    :aria-checked="knobDark"
    aria-label="Tume režiim"
    :title="knobDark ? 'Lülita heledaks' : 'Lülita tumedaks'"
    @click="onToggle"
  >
    <span class="slider" :class="{ 'is-dark': knobDark }" aria-hidden="true">
      <span class="knob">{{ knobDark ? '🌙' : '☀️' }}</span>
    </span>
  </button>
</template>

<style scoped>
.toggle-switch {
  display: inline-block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.toggle-switch:focus-visible {
  outline: none;
}
.toggle-switch:focus-visible .slider {
  box-shadow: 0 0 0 2px var(--color-lavender);
}

.slider {
  display: block;
  position: relative;
  width: 50px;
  height: 25px;
  border-radius: 25px;
  background-color: #ccc;
  transition: background-color 0.3s;
}

.slider.is-dark {
  background-color: var(--color-dusk);
}

/* Light mode: knob right (sun). Dark mode: knob slides LEFT (moon). */
.knob {
  position: absolute;
  top: 50%;
  left: 3px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background-color: #ffffff;
  transform: translate(25px, -50%);
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  user-select: none;
}

.is-dark .knob {
  transform: translate(0, -50%);
}
</style>
