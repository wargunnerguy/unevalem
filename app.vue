<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(() => initTheme())

// Per-route canonical (replaces the removed global homepage canonical) so each
// article/page is indexed under its own URL rather than as a homepage duplicate.
const route = useRoute()
const { siteUrl } = useRuntimeConfig().public
useHead({
  link: [{ rel: 'canonical', href: computed(() => `${siteUrl}${route.path}`) }],
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <!-- Patterned base: pages leave their root transparent so the sleep-icon
         texture shows everywhere; colored hero sections carry the class
         themselves. Header and footer stay pattern-free by design. -->
    <main class="flex-1 bg-moonlight sleep-pattern">
      <NuxtPage />
    </main>
    <AppFooter />
    <ClientOnly>
      <SocialProofToast />
      <CartDrawer />
    </ClientOnly>
    <CookieConsent />
  </div>
</template>
