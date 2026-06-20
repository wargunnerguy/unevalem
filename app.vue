<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(() => initTheme())
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <AnnouncementBanner />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <AppFooter />
    <ClientOnly>
      <SocialProofToast />
    </ClientOnly>
  </div>
</template>
