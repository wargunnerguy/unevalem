import type { PainPage, CalcType, UserProfile } from '~/types'

export function usePains() {
  const { data, pending, error } = useFetch<PainPage[]>('/api/pains', {
    default: () => [] as PainPage[],
  })

  const pains = computed(() => (data.value ?? []).filter(p => p.active))

  return { pains, pending, error }
}

export function usePain(slug: string) {
  const { pains, pending, error } = usePains()
  const pain = computed<PainPage | null>(() => pains.value.find(p => p.slug === slug) ?? null)
  // `pains` is returned too so callers can tell "loaded, and this slug is gone"
  // apart from "nothing loaded" — the two need very different handling.
  return { pain, pains, pending, error }
}

// "complaint:wake-at-night;sweating:often" → { complaint: 'wake-at-night', … }
// Unknown keys are dropped rather than trusted: the string is authored in a
// spreadsheet cell, and a typo must not inject junk into the calculator state.
const PREFILLABLE = new Set<string>([
  'position', 'bodyType', 'neckPain', 'sweating', 'temp', 'blanketWeight',
  'partner', 'allergies', 'pillowAge', 'complaint', 'backPain', 'mattressAge',
  'age', 'sleepQuality', 'pillowCount', 'currentMattress', 'roomTemp',
  'problemSeason',
])

export function parsePrefill(raw: string): Partial<UserProfile> {
  if (!raw) return {}
  const out: Record<string, string> = {}
  for (const pair of raw.split(';')) {
    const [key, value] = pair.split(':').map(s => s.trim())
    if (key && value && PREFILLABLE.has(key)) out[key] = value
  }
  return out as Partial<UserProfile>
}

// `calc:blanket` → 'blanket'. Anything else (quiz:*, lead) yields null, which
// is what tells the page not to embed a calculator.
export function parseCalcType(ctaType: string): CalcType | null {
  if (!ctaType.startsWith('calc:')) return null
  const type = ctaType.slice('calc:'.length).trim()
  return (type === 'pillow' || type === 'blanket' || type === 'mattress') ? type : null
}
