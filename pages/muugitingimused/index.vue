<script setup lang="ts">
import { termsPage } from '~/utils/copy'

useHead({
  title: termsPage.metaTitle,
  meta: [
    { name: 'description', content: termsPage.metaDescription },
    { property: 'og:title', content: termsPage.metaTitle },
    { property: 'og:url', content: 'https://unevalem.ee/muugitingimused' },
  ],
})
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-midnight sleep-pattern px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">{{ termsPage.heading }}</h1>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <section v-for="section in termsPage.sections" :key="section.heading">
        <h2 class="font-heading text-xl text-midnight mb-2">{{ section.heading }}</h2>
        <p class="text-sm text-midnight leading-relaxed whitespace-pre-line">{{ section.body }}</p>
      </section>
    </div>
  </div>
</template>
