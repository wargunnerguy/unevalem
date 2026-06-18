import type { UserProfile, CalculatorResult, ProductRec, PillowLoft } from '~/types'

function inferLoft(position: UserProfile['position']): PillowLoft {
  if (position === 'stomach') return 'low'
  if (position === 'back') return 'medium'
  if (position === 'side') return 'high'
  return 'medium'
}

const pillowMap: Record<UserProfile['position'], Pick<ProductRec, 'name' | 'reason'>> = {
  side: {
    name: 'Bambuspadi külilimagajale',
    reason: 'Kõrge tugi hoiab kaela ja lülisamba joones — vähendab hommikust kaelavalu.',
  },
  back: {
    name: 'Bambuspadi selilimagajale',
    reason: 'Keskmise kõrgusega padi toetab kaelaosa loomulikus, neutraalses asendis.',
  },
  stomach: {
    name: 'Õhuke bambuspadi',
    reason: 'Madal kõrgus hoiab kaela ülevenimise ära ja vähendab survet lülisambale.',
  },
  combo: {
    name: 'Universaalne bambuspadi',
    reason: 'Paindlik keskmise kõrgusega padi, mis kohandub erinevate magamisasenditega.',
  },
}

const blanketMap: Record<
  UserProfile['temp'],
  Pick<ProductRec, 'name' | 'reason' | 'urgency'>
> = {
  hot: {
    name: 'Bambustekk — termoreguleeriv',
    reason: 'Bambus on looduslikult hingav ja niiskust juhtiv — hoiab sind öösiti jahedalt.',
    urgency: 'must-have',
  },
  cold: {
    name: 'Soe talvetekk',
    reason: 'Tihedam täidis hoiab vajaliku soojuse ka jahedamates tingimustes.',
    urgency: 'nice-to-have',
  },
  normal: {
    name: 'Nelja aastaaegade bambustekk',
    reason: 'Universaalne valik, mis reguleerib temperatuuri aastaringselt.',
    urgency: 'nice-to-have',
  },
}

export function getRecommendations(profile: UserProfile): CalculatorResult {
  const recs: ProductRec[] = []
  const tips: string[] = []

  recs.push({
    id: 'pillow',
    ...pillowMap[profile.position],
    urgency: 'must-have',
    category: 'pillow',
    linkUrl: '#',
  })

  recs.push({
    id: 'blanket',
    ...blanketMap[profile.temp],
    category: 'blanket',
    linkUrl: '#',
  })

  if (profile.partner === 'shared') {
    recs.push({
      id: 'blanket-extra',
      name: 'Eraldi kerged bambustekid',
      reason: 'Eraldi tekid vähendavad öiseid häireid kuni 30% — kummalgi on oma temperatuurikontroll.',
      urgency: 'nice-to-have',
      category: 'blanket',
      linkUrl: '#',
    })
    tips.push(
      'Eraldi tekid on lihtne viis mõlema partneri und parandada — ilma kaotuste ja kompromissideta.',
    )
  }

  if (profile.partner === 'separate') {
    tips.push('Tark valik! Eraldi tekid on üks lihtsamaid viise öiseid häireid vähendada.')
  }

  if (profile.issues.includes('neck')) {
    tips.push(
      'Kaelavalude vastu: vaheta padi — pärast 2 aastat kaotab see tugijõu ja painutab kaela vales asendis.',
    )
  }
  if (profile.issues.includes('hot')) {
    tips.push('Ülekuumenemise vastu: alanda magamistoa temperatuuri 16–19°C-ni ja vali hingavad voodimaterjalid.')
  }
  if (profile.issues.includes('insomnia')) {
    tips.push(
      'Kiirema uinumise jaoks: loo kindel magamaminekurituaal — sama kellaaeg, sama järjestus — keha õpib märku.',
    )
  }
  if (profile.issues.includes('light')) {
    tips.push('Kerge ärkaja — proovi valget müra või kõrvatroppe, mis blokeerivad ärritavad helid.')
  }

  const fallbackTips = [
    'Hoia magamistuba pimedana ja jahedana (16–19°C) — need on kaks olulisimat unekeskkonna tegurit.',
    'Regulaarne unegraafik tugevdab keha sisekella paremini kui ükski lisand.',
    'Bambusvoodipesu on hingavam kui puuvill ja sobib nii sooja- kui jahedamale magajale.',
  ]
  let i = 0
  while (tips.length < 2 && i < fallbackTips.length) tips.push(fallbackTips[i++])

  // Score
  let score = 60

  const loft = profile.loft ?? inferLoft(profile.position)
  const badCombos: Partial<Record<UserProfile['position'], PillowLoft[]>> = {
    side: ['low'],
    back: ['high'],
    stomach: ['high', 'medium'],
  }
  if (badCombos[profile.position]?.includes(loft)) score -= 15
  if (profile.temp === 'hot') score -= 10
  score -= profile.issues.length * 5
  score = Math.max(0, Math.min(100, score))

  return {
    currentScore: score,
    improvedScore: Math.min(100, score + 20),
    recommendations: recs.slice(0, 3),
    personalTips: tips.slice(0, 3),
  }
}
