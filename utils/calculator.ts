import type { UserProfile, Product, CalculatorResult, ProductRec } from '~/types'

function buildRequiredTags(profile: UserProfile): string[] {
  const tags: string[] = []

  if (profile.position === 'side') tags.push('side-sleeper')
  else if (profile.position === 'back') tags.push('back-sleeper')
  else if (profile.position === 'stomach') tags.push('stomach-sleeper')
  else tags.push('all-positions')

  if (profile.bodyType === 'broad') tags.push('broad-shoulders')
  else tags.push('standard-shoulders')

  if (profile.position === 'stomach') tags.push('low-loft')
  else if (profile.position === 'back') tags.push('medium-loft')
  else if (profile.position === 'side') tags.push('high-loft')

  if (profile.sweating === 'often' || profile.temp === 'hot') {
    tags.push('cooling')
  } else if (profile.temp === 'cold') {
    tags.push('warming')
  } else {
    tags.push('all-season')
  }

  if (profile.allergies !== 'none') {
    tags.push('hypoallergenic')
    tags.push('dust-mite-resistant')
  }

  if (profile.blanketWeight === 'light') tags.push('lightweight')
  else if (profile.blanketWeight === 'heavy') tags.push('heavy')
  else tags.push('medium-weight')

  return tags
}

function scoreProduct(product: Product, required: string[]): number {
  return required.filter(tag => product.tags.includes(tag)).length
}

function pillowReason(profile: UserProfile): string {
  if (profile.neckPain === 'often') {
    return 'Sobiva kõrgusega padi toetab kaela õiges asendis — hommikune kaelavalu väheneb märgatavalt.'
  }
  if (profile.position === 'side' && profile.bodyType === 'broad') {
    return 'Kõrge tugi täidab laiemate õlgadega magaja kaela ja pea vahe — hoiab lülisamba sirges.'
  }
  if (profile.position === 'side') {
    return 'Kõrge tugi hoiab kaela ja lülisamba sirges joones külilimagamisel.'
  }
  if (profile.position === 'stomach') {
    return 'Madal profiil hoiab kaela ülevenimise ära ja vähendab survet lülisambale.'
  }
  if (profile.position === 'back') {
    return 'Keskmise kõrgusega padi toetab kaelaosa neutraalses asendis kogu öö.'
  }
  return 'Reguleeritav täidis kohandub sinu magamisasendiga ja toetab kaela täpselt nii palju kui vaja.'
}

function blanketReason(profile: UserProfile): string {
  if (profile.sweating === 'often' || profile.temp === 'hot') {
    return 'Bambus juhib niiskust ja soojust eemale — ärkad kuivalt ja värskena isegi soojas toas.'
  }
  if (profile.temp === 'cold') {
    return 'Tihedam täidis hoiab vajaliku soojuse ka jahedamates tingimustes kogu öö.'
  }
  return 'Universaalne bambustekk reguleerib temperatuuri aastaringselt nii soojal kui jahedal ööl.'
}

export function getRecommendations(profile: UserProfile, products: Product[]): CalculatorResult {
  const required = buildRequiredTags(profile)
  const active = products.filter(p => p.active)

  const pillows = active.filter(p => p.category === 'pillow')
  pillows.sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
  const bestPillow = pillows[0]

  const blankets = active.filter(p => p.category === 'blanket')
  blankets.sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
  const bestBlanket = blankets[0]

  const recs: ProductRec[] = []
  const tips: string[] = []

  if (bestPillow) {
    recs.push({
      id: bestPillow.id,
      name: bestPillow.name,
      reason: pillowReason(profile),
      urgency: 'must-have',
      category: 'pillow',
      linkUrl: bestPillow.storeUrl,
      priceText: bestPillow.priceText,
      imageUrl: bestPillow.imageUrl,
    })
  }

  if (bestBlanket) {
    recs.push({
      id: bestBlanket.id,
      name: bestBlanket.name,
      reason: blanketReason(profile),
      urgency: profile.sweating === 'often' || profile.temp === 'hot' ? 'must-have' : 'nice-to-have',
      category: 'blanket',
      linkUrl: bestBlanket.storeUrl,
      priceText: bestBlanket.priceText,
      imageUrl: bestBlanket.imageUrl,
    })
  }

  if (profile.partner === 'shared') {
    tips.push('Eraldi tekid on lihtsa viis mõlema partneri und parandada — kummalgi on oma temperatuurikontroll.')
  }
  if (profile.neckPain === 'often' || profile.neckPain === 'sometimes') {
    tips.push('Kaelavalude vastu: kontrolli, kas padi toetab kaela — pärast 2–3 aastat kaotab enamik padju oma kuju.')
  }
  if (profile.sweating === 'often') {
    tips.push('Ülekuumenemise vastu: hoia magamistuba 16–19°C juures ja vali hingavad voodimaterjalid.')
  }
  if (profile.complaint === 'cant-sleep') {
    tips.push('Kiirema uinumise jaoks: loo kindel magamaminekurituaal — sama kellaaeg, sama järjestus.')
  } else if (profile.complaint === 'wake-at-night') {
    tips.push('Öiste ärkamiste vastu: veendu, et tuba on piisavalt jahe ja pime.')
  } else if (profile.complaint === 'wake-tired') {
    tips.push('Väsinuna ärkamine viitab sageli liiga lühikesele unefaasile — proovi 15 min varem magama minna.')
  }
  if (profile.pillowAge === '3y+') {
    tips.push('Sinu praegune padi on ilmselt oma elu ära elanud — üle 3 aasta vana padi ei toeta enam kaela korralikult.')
  }

  const fallback = [
    'Hoia magamistuba pimedana ja jahedana (16–19°C) — need on kaks olulisimat unekeskkonna tegurit.',
    'Regulaarne unegraafik tugevdab keha sisekella paremini kui ükski lisand.',
    'Bambusvoodipesu on hingavam kui puuvill ja sobib nii sooja- kui jahedamale magajale.',
  ]
  let i = 0
  while (tips.length < 2 && i < fallback.length) tips.push(fallback[i++])

  let score = 60
  if (profile.neckPain === 'often') score -= 10
  else if (profile.neckPain === 'sometimes') score -= 5
  if (profile.sweating === 'often') score -= 10
  else if (profile.sweating === 'sometimes') score -= 5
  if (profile.pillowAge === '3y+') score -= 8
  else if (profile.pillowAge === '1-3y') score -= 3
  if (profile.complaint !== 'none') score -= 7
  score = Math.max(20, Math.min(100, score))

  return {
    currentScore: score,
    improvedScore: Math.min(100, score + 22),
    recommendations: recs,
    personalTips: tips.slice(0, 3),
  }
}
