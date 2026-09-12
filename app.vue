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
      <!-- SocialProofToast is deliberately NOT mounted. Every notification row
           the sheet has ever held was invented (purchases that never happened,
           ratings nobody gave), which contradicts the honesty overhaul in
           CLAUDE.md and is a per-se unfair commercial practice under the
           Omnibus-amended EU Directive 2005/29/EC Annex I - dormant without
           traffic, active the moment ads run. The component and its composable
           stay in the tree: remount this line once real orders exist and the
           Apps Script can feed it truthfully. Never with hand-written rows. -->
      <CartDrawer />
    </ClientOnly>
    <CookieConsent />
  </div>
</template>
