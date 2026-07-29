<script setup lang="ts">
import { lead } from '~/utils/copy'

// Generalised from shop/WaitlistForm.vue, which stays as it is: a product
// waitlist is a different purpose and a different legal basis, and merging the
// two would blur what each subscriber actually agreed to.
const props = withDefaults(defineProps<{
  /** Where the sign-up happened: 'calc-result:pillow', 'quiz:chronotype:owl',
   *  'article:<slug>', 'footer'. Recorded so we can see which surface works. */
  source: string
  /** 'inline' on light backgrounds, 'dark' in the footer. */
  variant?: 'inline' | 'dark'
  heading?: string
}>(), {
  variant: 'inline',
  heading: '',
})

const { sessionId } = useABTest()
const { attrPayload } = useAttribution()
const config = useRuntimeConfig()

const email = ref('')
const consent = ref(false)
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const errorMsg = ref('')

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const canSubmit = computed(
  () => EMAIL_RE.test(email.value.trim()) && consent.value && state.value !== 'sending',
)

const isDark = computed(() => props.variant === 'dark')
const fieldId = computed(() => `lead-${props.source.replace(/[^a-z0-9]+/gi, '-')}`)

async function submit() {
  const value = email.value.trim()
  if (!EMAIL_RE.test(value)) {
    errorMsg.value = lead.invalidEmail
    state.value = 'error'
    return
  }
  // Belt and braces: the checkbox is also required to enable the button, but a
  // submission without consent must never reach the sheet.
  if (!consent.value || state.value === 'sending') return

  state.value = 'sending'
  errorMsg.value = ''

  const url = config.public.sheetsApiUrl as string
  if (!url) {
    state.value = 'error'
    errorMsg.value = lead.error
    return
  }

  try {
    // no-cors fire-and-forget, same as every other write path here: Apps Script
    // redirects break CORS preflights. The script validates and timestamps.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'subscribe',
        email: value,
        source: props.source,
        consent: true,
        // Stored verbatim, with a version, so the exact wording someone agreed
        // to is reconstructable later.
        consentText: `${lead.consentLabel} [v${lead.consentVersion}]`,
        sessionId: sessionId.value,
        env: (config.public.siteUrl as string).includes('test.') ? 'staging' : 'prod',
        ...attrPayload(),
      }),
    })
    state.value = 'done'
    gaEvent('lead', { source: props.source })
  } catch {
    state.value = 'error'
    errorMsg.value = lead.error
  }
}
</script>

<template>
  <div
    class="rounded-xl p-4"
    :class="isDark ? 'bg-dusk/60' : 'border border-lavender/30 bg-foam'"
  >
    <p v-if="state === 'done'" class="text-sm font-medium" :class="isDark ? 'text-gold' : 'text-success'">
      {{ lead.confirm }}
    </p>

    <form v-else class="space-y-3" @submit.prevent="submit">
      <div>
        <p class="font-heading text-base mb-1" :class="isDark ? 'text-foam' : 'text-midnight'">
          {{ heading || lead.headingGeneric }}
        </p>
        <p class="text-xs leading-snug" :class="isDark ? 'text-muted' : 'text-muted'">
          {{ lead.promise }}
        </p>
      </div>

      <div class="flex gap-2">
        <label class="sr-only" :for="fieldId">{{ lead.placeholder }}</label>
        <input
          :id="fieldId"
          v-model="email"
          type="email"
          required
          :placeholder="lead.placeholder"
          class="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
          :class="isDark
            ? 'border-lavender/30 bg-midnight text-foam placeholder:text-muted/70'
            : 'border-lavender/40 bg-foam text-midnight placeholder:text-muted/60'"
        />
        <button
          type="submit"
          :disabled="!canSubmit"
          class="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender disabled:opacity-40 disabled:cursor-not-allowed"
          :class="isDark ? 'bg-gold text-midnight' : 'bg-midnight text-foam'"
        >
          {{ state === 'sending' ? lead.sending : lead.submit }}
        </button>
      </div>

      <!-- Unticked by default and required. Never pre-check this. -->
      <label class="flex items-start gap-2 text-[11px] leading-snug cursor-pointer" :class="isDark ? 'text-muted' : 'text-muted'">
        <input
          v-model="consent"
          type="checkbox"
          class="mt-0.5 shrink-0 rounded border-lavender/50 focus:ring-2 focus:ring-lavender"
        />
        <span>
          {{ lead.consentLabel }}
          <NuxtLink to="/privaatsus" class="underline underline-offset-2 hover:opacity-80">
            {{ lead.privacyLink }}
          </NuxtLink>
        </span>
      </label>

      <p v-if="state === 'error'" class="text-xs text-red-500">{{ errorMsg || lead.error }}</p>
    </form>
  </div>
</template>
