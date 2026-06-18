<script setup lang="ts">
interface Option {
  emoji: string
  label: string
  value: string
}

const props = defineProps<{
  question: string
  options: Option[]
  selected?: string
}>()

const emit = defineEmits<{
  select: [value: string]
}>()

const gridClass = computed(() => {
  if (props.options.length <= 2) return 'grid-cols-2'
  if (props.options.length === 3) return 'grid-cols-1 sm:grid-cols-3'
  return 'grid-cols-2'
})
</script>

<template>
  <div class="py-2 space-y-6">
    <h2 class="font-serif text-2xl md:text-3xl text-midnight text-center leading-tight">
      {{ question }}
    </h2>

    <div class="grid gap-3" :class="gridClass">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :aria-pressed="selected === opt.value"
        class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender focus-visible:ring-offset-2 cursor-pointer min-h-[88px]"
        :class="selected === opt.value
          ? 'bg-midnight border-midnight text-foam shadow-sm'
          : 'bg-foam border-gray-200 text-midnight hover:border-lavender hover:bg-moonlight active:scale-95'"
        @click="emit('select', opt.value)"
      >
        <span class="text-4xl leading-none select-none" aria-hidden="true">{{ opt.emoji }}</span>
        <span class="text-sm font-medium text-center leading-tight">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>
