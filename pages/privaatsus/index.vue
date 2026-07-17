<script setup lang="ts">
import { privacyPage } from '~/utils/copy'

useHead({
  title: privacyPage.metaTitle,
  meta: [
    { name: 'description', content: privacyPage.metaDescription },
    { property: 'og:title', content: privacyPage.metaTitle },
    { property: 'og:description', content: privacyPage.metaDescription },
  ],
})
</script>

<template>
  <div class="min-h-screen">

    <!-- Header -->
    <div class="bg-midnight sleep-pattern px-4 py-10">
      <div class="max-w-2xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-foam leading-tight">
          {{ privacyPage.heading }}
        </h1>
        <p class="text-muted text-sm mt-3">{{ privacyPage.lastUpdated }}</p>
      </div>
    </div>

    <!-- Body -->
    <div class="max-w-2xl mx-auto px-4 py-10">
      <p class="text-midnight leading-relaxed mb-10">{{ privacyPage.intro }}</p>

      <section
        v-for="section in privacyPage.sections"
        :key="section.heading"
        class="mb-9"
      >
        <h2 class="font-heading text-xl md:text-2xl text-midnight mb-3">
          {{ section.heading }}
        </h2>
        <p class="text-midnight leading-relaxed">{{ section.body }}</p>
        <ul v-if="'items' in section && section.items" class="mt-3 space-y-2">
          <li
            v-for="(item, i) in section.items"
            :key="i"
            class="flex items-start gap-3 text-sm text-midnight leading-relaxed"
          >
            <span class="text-lavender shrink-0 mt-0.5" aria-hidden="true">✦</span>
            {{ item }}
          </li>
        </ul>
      </section>
    </div>

  </div>
</template>
