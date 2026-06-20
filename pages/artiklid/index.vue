<script setup lang="ts">
import { blogPage, common } from '~/utils/copy'

useHead({
  title: blogPage.metaTitle,
  meta: [
    { name: 'description', content: blogPage.metaDescription },
    { property: 'og:title', content: blogPage.metaTitle },
    { property: 'og:description', content: blogPage.metaDescription },
    { property: 'og:url', content: 'https://unevalem.ee/artiklid' },
  ],
})

const { posts, pending } = usePosts()
</script>

<template>
  <div class="min-h-screen bg-moonlight">

    <!-- Header band -->
    <div class="bg-midnight px-4 py-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-heading text-4xl md:text-5xl text-gold leading-tight">
          {{ blogPage.heading }}
        </h1>
        <p class="mt-2 text-lavender text-base">
          {{ blogPage.metaDescription }}
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="pending" class="flex justify-center py-16">
        <p class="text-muted">{{ common.loading }}</p>
      </div>
      <PostGrid v-else :posts="posts" />
    </div>

  </div>
</template>
