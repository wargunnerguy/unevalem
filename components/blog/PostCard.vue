<script setup lang="ts">
import type { Post } from '~/types'
import { blogCategories, blogPage, common } from '~/utils/copy'

defineProps<{
  post: Post
}>()

const categoryLabel = (cat: Post['category']) =>
  blogCategories[cat as keyof typeof blogCategories] ?? cat
</script>

<template>
  <NuxtLink :to="`/artiklid/${post.slug}`" class="block group h-full">
    <article class="bg-foam rounded-xl overflow-hidden border border-gray-100 hover:border-lavender/50 hover:shadow-md transition-all duration-200 h-full flex flex-col">

      <!-- Visual header -->
      <div class="overflow-hidden shrink-0">
        <img
          v-if="post.coverImage"
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          v-else
          class="h-32 bg-gradient-to-br from-midnight to-dusk flex items-center justify-center"
          aria-hidden="true"
        >
          <span class="text-5xl opacity-20 select-none">🌙</span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-4 flex flex-col flex-1 gap-2">
        <!-- Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs px-2 py-0.5 rounded-full border border-lavender/40 bg-moonlight text-midnight font-medium">
            {{ categoryLabel(post.category) }}
          </span>
          <span v-if="post.isFeatured" class="text-xs px-2 py-0.5 rounded-full bg-gold text-midnight font-semibold">
            {{ common.popularBadge }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="font-serif text-lg text-midnight leading-snug">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-sm text-muted leading-relaxed line-clamp-2 flex-1">
          {{ post.excerpt }}
        </p>

        <!-- Reading time -->
        <p class="text-xs text-muted/70 mt-auto pt-1">
          {{ blogPage.readingTime(post.readingTimeMin) }}
        </p>
      </div>

    </article>
  </NuxtLink>
</template>
