<script setup lang="ts">
// Slider-style dark mode toggle, after
// e-dimensionz.com/devinsights/how-to-create-a-toggle-switch-for-dark-mode-with-css-and-javascript
// (hidden checkbox + .slider span, 50×25 pill, 0.3s knob transition).
// Persistence + html.dark toggling stay in useTheme.
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <label
    class="toggle-switch ml-1 shrink-0"
    :title="isDark ? 'Lülita heledaks' : 'Lülita tumedaks'"
  >
    <input
      type="checkbox"
      :checked="isDark"
      aria-label="Tume režiim"
      @change="toggleTheme"
    />
    <span class="slider" aria-hidden="true">
      <span class="icon sun">☀️</span>
      <span class="icon moon">🌙</span>
    </span>
  </label>
</template>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background-color: #ccc;
  border-radius: 25px;
  transition: background-color 0.3s;
}

/* The knob */
.slider::before {
  content: '';
  position: absolute;
  width: 19px;
  height: 19px;
  left: 3px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s;
  z-index: 1;
}

input:checked + .slider {
  background-color: var(--color-dusk);
}

input:checked + .slider::before {
  transform: translate(25px, -50%);
}

input:focus-visible + .slider {
  box-shadow: 0 0 0 2px var(--color-lavender);
}

/* Track glyphs: the knob covers the inactive side. Unchecked (light) — knob
   left over the sun, moon visible on the side you'd slide to. Checked (dark)
   — knob right over the moon, sun visible. */
.icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  line-height: 1;
  user-select: none;
}
.sun { left: 5px; }
.moon { right: 5px; }
</style>
