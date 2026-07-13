import type { UserProfile, Product, CalculatorResult, ProductRec, CalcType } from '~/types'

function scoreProduct(product: Product, required: string[]): number {
  return required.filter(tag => product.tags.includes(tag)).length
}

function fillTips(tips: string[], fallback: string[]): string[] {
  const result = [...tips]
  let i = 0
  while (result.length < 2 && i < fallback.length) result.push(fallback[i++])
  return result
}

// Honest improvement gain: smaller when score is already high
function calcImprovement(score: number): number {
  if (score >= 85) return 5
  if (score >= 70) return 12
  return 20
}

function buildPillowTags(profile: UserProfile): string[] {
  const tags: string[] = []
  if (profile.position === 'side') tags.push('side-sleeper', 'high-loft')
  else if (profile.position === 'back') tags.push('back-sleeper', 'medium-loft')
  else if (profile.position === 'stomach') tags.push('stomach-sleeper', 'low-loft')
  else tags.push('all-positions')
  if (profile.bodyType === 'broad') tags.push('broad-shoulders')
  else tags.push('standard-shoulders')
  if (profile.allergies === 'dust-mites') tags.push('hypoallergenic', 'dust-mite-resistant')
  else if (profile.allergies === 'synthetic' || profile.allergies === 'other') tags.push('hypoallergenic')
  return tags
}

function buildBlanketTags(profile: UserProfile): string[] {
  const tags: string[] = []
  if (profile.sweating === 'often' || profile.temp === 'hot') tags.push('cooling')
  else if (profile.temp === 'cold') tags.push('warming')
  else tags.push('all-season')
  if (profile.allergies === 'dust-mites') tags.push('hypoallergenic', 'dust-mite-resistant')
  else if (profile.allergies === 'synthetic' || profile.allergies === 'other') tags.push('hypoallergenic')
  if (profile.blanketWeight === 'light') tags.push('lightweight')
  else if (profile.blanketWeight === 'heavy') tags.push('heavy')
  else tags.push('medium-weight')
  return tags
}

function buildMattressTags(profile: UserProfile): string[] {
  const tags: string[] = []
  if (profile.position === 'side') tags.push('side-sleeper', 'pressure-relief')
  else if (profile.position === 'back') tags.push('back-sleeper')
  else if (profile.position === 'stomach') tags.push('stomach-sleeper', 'firm')
  else tags.push('all-positions')
  if (profile.bodyType === 'broad') tags.push('firm')
  else if (profile.bodyType === 'slim') tags.push('soft-to-medium')
  else tags.push('medium-firm')
  if (profile.backPain === 'often') tags.push('orthopedic', 'pressure-relief')
  if (profile.partner === 'shared') tags.push('motion-isolation')
  return tags
}

function pillowReason(profile: UserProfile, goodShape: boolean): string {
  if (goodShape) return 'Sinu praegune olukord on hea. Bambuspadi lisab hingavuse, loodusliku hüpoallergeensuse ja pikema kestvuse — mugavuse täiendus, mitte hädavajadus.'
  if (profile.neckPain === 'often') return 'Sobiva kõrgusega padi toetab kaela õiges asendis — hommikune kaelavalu väheneb märgatavalt.'
  if (profile.position === 'side' && profile.bodyType === 'broad') return 'Kõrge tugi täidab laiemate õlgadega magaja kaela ja pea vahe — hoiab lülisamba sirges.'
  if (profile.position === 'side') return 'Kõrge tugi hoiab kaela ja lülisamba sirges joones külilimagamisel.'
  if (profile.position === 'stomach') return 'Madal profiil hoiab kaela ülevenimise ära ja vähendab survet lülisambale.'
  if (profile.position === 'back') return 'Keskmise kõrgusega padi toetab kaelaosa neutraalses asendis kogu öö.'
  return 'Reguleeritav täidis kohandub sinu magamisasendiga ja toetab kaela täpselt nii palju kui vaja.'
}

function blanketReason(profile: UserProfile, goodShape: boolean): string {
  if (goodShape) return 'Sul pole praegu termoregulatsiooniga probleeme. Bambus pakub siiski kuni 3× paremat niiskusjuhtivust kui puuvill — märkad vahet soojematel öödel.'
  if (profile.sweating === 'often' || profile.temp === 'hot') return 'Bambus juhib niiskust ja soojust eemale — ärkad kuivalt ja värskena isegi soojas toas.'
  if (profile.temp === 'cold') return 'Tihedam täidis hoiab vajaliku soojuse ka jahedamates tingimustes kogu öö.'
  return 'Universaalne bambustekk reguleerib temperatuuri aastaringselt nii soojal kui jahedal ööl.'
}

function mattressReason(profile: UserProfile, goodShape: boolean): string {
  if (goodShape) return 'Sinu madrats on praegu heas korras. Uus madrats on mugavuse upgrade, mitte asendus — tunned vahet juba esimesel ööl, kuid kiiremat vajadust pole.'
  if (profile.backPain === 'often') return 'Ortopeediline tugi leevendab seljavalu, hoides lülisamba öö jooksul neutraalses asendis.'
  if (profile.position === 'side') return 'Pehme tsoonimine vähendab survet õlgadele ja puusadele — ärkad ilma tuimusteta.'
  if (profile.position === 'stomach') return 'Kindel tugi hoiab puusad kõrgemal, vähendades lülisamba ülepinget kõhulimagamisel.'
  if (profile.bodyType === 'broad') return 'Tugevam kandevõime tagab korrektse toestuse kogu öö, hoolimata kehakaalust.'
  return 'Hea madrats kohandub sinu kehakujuga ja toetab lülisamba loomulikku kumerust.'
}

export function getRecommendations(profile: UserProfile, products: Product[], calcType: CalcType): CalculatorResult {
  const active = products.filter(p => p.active)

  if (calcType === 'pillow') {
    // Honest scoring: positive signals push score UP
    let score = 70
    if (profile.neckPain === 'never') score += 12
    else if (profile.neckPain === 'sometimes') score -= 6
    else if (profile.neckPain === 'often') score -= 15
    if (profile.pillowAge === 'new') score += 8
    else if (profile.pillowAge === '1-3y') score -= 4
    else if (profile.pillowAge === '3y+') score -= 12
    if (profile.allergies !== 'none') score -= 3
    if (profile.age === 'senior' && profile.pillowAge !== 'new') score -= 5
    if (profile.pillowCount === 'two-plus') score -= 4
    score = Math.max(20, Math.min(98, score))

    const goodShape = score >= 85
    const urgency: ProductRec['urgency'] = score >= 70 ? 'nice-to-have' : 'must-have'

    const required = buildPillowTags(profile)
    const sorted = [...active.filter(p => p.category === 'pillow')].sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
    const best = sorted[0]
    const recs: ProductRec[] = best
      ? [{ id: best.id, name: best.name, reason: pillowReason(profile, goodShape), urgency, category: 'pillow', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl }]
      : []

    const tips: string[] = []
    if (profile.neckPain === 'often' || profile.neckPain === 'sometimes') tips.push('Kaelavalude vastu: kontrolli, kas padi toetab kaela — pärast 2–3 aastat kaotab enamik padju oma kuju.')
    if (profile.pillowAge === '3y+') tips.push('Sinu praegune padi on ilmselt oma elu ära elanud — üle 3 aasta vana padi ei toeta enam kaela korralikult.')
    if (profile.allergies === 'dust-mites') tips.push('Bambus on looduslikult tolmulestadele ebasoodne keskkond — tõhus valik tolmulesta-allergiaga magajale.')
    else if (profile.allergies === 'synthetic') tips.push('Bambus on naturaalne kiud — erineb täielikult sünteetilistest materjalidest ja sobib enamikule.')
    else if (profile.allergies === 'other') tips.push('Bambus on looduslikult hüpoallergeenne, kuid tundmatu allergia puhul soovitame enne ostu oma arsti käest küsida.')
    if (goodShape) tips.push('Sul pole praegu kiireloomulist vajadust. Kui valid uue padja, on bambus pikaajaline investeering une kvaliteeti.')

    const finalTips = fillTips(tips, ['Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.', 'Regulaarne unegraafik tugevdab keha sisekella paremini kui ükski lisand.'])
    const improvedScore = Math.min(98, score + calcImprovement(score))

    return { currentScore: score, improvedScore, recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
  }

  if (calcType === 'blanket') {
    // Honest scoring
    let score = 70
    if (profile.sweating === 'rarely' && profile.temp !== 'hot') score += 15
    else if (profile.sweating === 'rarely') score += 5
    else if (profile.sweating === 'sometimes') score -= 5
    else if (profile.sweating === 'often') score -= 12
    if (profile.sweating !== 'rarely' && profile.temp === 'hot') score -= 8
    if (profile.temp === 'hot' && profile.blanketWeight === 'heavy') score -= 5
    if (profile.allergies !== 'none') score -= 3
    score = Math.max(20, Math.min(98, score))

    const goodShape = score >= 85
    const urgency: ProductRec['urgency'] = (profile.sweating === 'often' || profile.temp === 'hot') ? 'must-have' : 'nice-to-have'

    const required = buildBlanketTags(profile)
    const sorted = [...active.filter(p => p.category === 'blanket')].sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
    const best = sorted[0]
    const recs: ProductRec[] = best
      ? [{ id: best.id, name: best.name, reason: blanketReason(profile, goodShape), urgency, category: 'blanket', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl }]
      : []

    const tips: string[] = []
    if (profile.sweating === 'often') tips.push('Ülekuumenemise vastu: hoia magamistuba 16–19 °C juures ja vali hingavad voodimaterjalid.')
    if (profile.partner === 'shared') tips.push('Eraldi tekid on lihtne viis mõlema partneri und parandada — kummalgi on oma temperatuurikontroll.')
    if (profile.temp === 'hot') tips.push('Bambus on üks hingavamaid looduslikke materjale — sobib ideaalselt soojasse magamistuppa.')
    if (profile.allergies === 'dust-mites') tips.push('Bambus on looduslikult tolmulestadele ebasoodne keskkond — tõhus valik tolmulesta-allergiaga magajale.')
    else if (profile.allergies === 'synthetic') tips.push('Bambus on naturaalne kiud — sobib enamikule sünteetikavastu tundlikele.')
    else if (profile.allergies === 'other') tips.push('Bambus on looduslikult hüpoallergeenne. Tundmatu allergia puhul soovitame enne ostu arsti käest küsida.')
    if (goodShape) tips.push('Sul pole praegu selgeid uneprobleeme. Uus tekk on mugavuse täiendus, mitte hädavajadus.')

    const finalTips = fillTips(tips, ['Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.', 'Bambusvoodipesu on hingavam kui puuvill ja sobib nii sooja- kui jahedamale magajale.'])
    const improvedScore = Math.min(98, score + calcImprovement(score))

    return { currentScore: score, improvedScore, recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
  }

  // mattress
  let score = 65
  if (profile.backPain === 'never') score += 12
  else if (profile.backPain === 'sometimes') score -= 8
  else if (profile.backPain === 'often') score -= 15
  if (profile.mattressAge === 'new') score += 12
  else if (profile.mattressAge === '1-3y') score += 5
  else if (profile.mattressAge === '3-5y') score -= 6
  else if (profile.mattressAge === '5y+') score -= 15
  if (profile.sleepQuality === 'poor') score -= 8
  else if (profile.sleepQuality === 'good') score += 6
  if (profile.age === 'senior') score -= 5
  score = Math.max(20, Math.min(98, score))

  const goodShape = score >= 85
  const urgency: ProductRec['urgency'] = score >= 70 ? 'nice-to-have' : 'must-have'

  const required = buildMattressTags(profile)
  const sorted = [...active.filter(p => p.category === 'mattress')].sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
  const best = sorted[0]
  const recs: ProductRec[] = best
    ? [{ id: best.id, name: best.name, reason: mattressReason(profile, goodShape), urgency, category: 'mattress', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl }]
    : []

  const tips: string[] = []
  if (profile.backPain === 'often' || profile.backPain === 'sometimes') tips.push('Seljavalu ei kao kohe, kuid õige kõvadusega madrats vähendab lihaspingeid juba esimestel nädalatel.')
  if (profile.mattressAge === '5y+') tips.push('Sinu madrats on oma kasuliku eluea lõpus — üle 8 aasta vana madrats ei toesta enam lülisambat korralikult.')
  else if (profile.mattressAge === '3-5y') tips.push('5–8 aasta vanune madrats hakkab enamasti vajuma ja kaotab tasapisi oma toestamisvõime.')
  if (goodShape) tips.push('Madrats on korras — kui mõtled vahetusele, tee seda siis, kui hakkad tundma esimesi ebamugavusi, mitte enne.')

  const finalTips = fillTips(tips, ['Madratsi vahetamise märgid: voodiservad vajuvad, hommikul tuimus või valu, keeruline mugavat asendit leida.', 'Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.'])
  const improvedScore = Math.min(98, score + calcImprovement(score))

  return { currentScore: score, improvedScore, recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
}
