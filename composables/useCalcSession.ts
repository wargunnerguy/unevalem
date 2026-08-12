import type { CalcType, SiteProfile, UserProfile } from '~/types'

export function useCalcSession() {
  const siteProfile = useCookie<SiteProfile>('uva-profile', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => ({}),
  })

  const donePillow   = computed(() => !!siteProfile.value.pillow)
  const doneBlanket  = computed(() => !!siteProfile.value.blanket)
  const doneMattress = computed(() => !!siteProfile.value.mattress)
  const completedCount = computed(() =>
    [donePillow.value, doneBlanket.value, doneMattress.value].filter(Boolean).length,
  )
  const allDone = computed(() => completedCount.value === 3)

  function firstUncompleted(): CalcType {
    if (!donePillow.value)   return 'pillow'
    if (!doneBlanket.value)  return 'blanket'
    if (!doneMattress.value) return 'mattress'
    return 'pillow'
  }

  // Stable SSR default is 'pillow'; syncActiveCalcType() corrects it on mount
  const activeCalcType = useState<CalcType>('active-calc-type', () => 'pillow')

  function syncActiveCalcType() {
    const next = firstUncompleted()
    if (activeCalcType.value !== next) activeCalcType.value = next
  }

  function getNextAfter(type: CalcType): CalcType | null {
    const order: CalcType[] = ['pillow', 'blanket', 'mattress']
    const start = order.indexOf(type)
    // Check from current+1 forward, then wrap
    for (let offset = 1; offset < order.length; offset++) {
      const candidate = order[(start + offset) % order.length]
      if (!siteProfile.value[candidate]) return candidate
    }
    return null
  }

  function storeCompletion(type: CalcType, answers: Partial<UserProfile>, productName: string) {
    siteProfile.value = {
      ...siteProfile.value,
      [type]: {
        answers: { ...answers } as Record<string, string>,
        productName,
        completedAt: new Date().toISOString(),
      },
    }
  }

  const mergedAnswers = computed((): Partial<UserProfile> => {
    const merged: Record<string, unknown> = {}
    if (siteProfile.value.pillow)   Object.assign(merged, siteProfile.value.pillow.answers)
    if (siteProfile.value.blanket)  Object.assign(merged, siteProfile.value.blanket.answers)
    if (siteProfile.value.mattress) Object.assign(merged, siteProfile.value.mattress.answers)
    return merged as Partial<UserProfile>
  })

  /**
   * `stepKeys` is passed in rather than looked up here: the questions now come
   * from the sheet via useCalculators(), and this composable is also used from
   * places that have no business fetching them.
   */
  function getPrefilledAnswers(type: CalcType, stepKeys: readonly string[]): Partial<UserProfile> {
    const merged = mergedAnswers.value as Record<string, unknown>
    return Object.fromEntries(
      stepKeys.filter(k => merged[k] !== undefined).map(k => [k, merged[k]]),
    ) as Partial<UserProfile>
  }

  return {
    siteProfile,
    donePillow, doneBlanket, doneMattress, completedCount, allDone,
    activeCalcType,
    syncActiveCalcType,
    getNextAfter, storeCompletion, mergedAnswers, getPrefilledAnswers,
  }
}
