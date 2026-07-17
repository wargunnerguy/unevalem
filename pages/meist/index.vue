<script setup lang="ts">
import { aboutPage } from '~/utils/copy'

useHead({
  title: aboutPage.metaTitle,
  meta: [
    { name: 'description', content: aboutPage.metaDescription },
    { property: 'og:title', content: aboutPage.metaTitle },
    { property: 'og:url', content: 'https://unevalem.ee/meist' },
  ],
})
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-midnight sleep-pattern px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">{{ aboutPage.heading }}</h1>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <section v-for="section in aboutPage.sections" :key="section.id" :id="section.id">
        <h2 class="font-heading text-2xl text-midnight mb-3">{{ section.heading }}</h2>
        <p class="text-sm text-midnight leading-relaxed whitespace-pre-line">{{ section.body }}</p>
      </section>
    </div>
  </div>
</template>
