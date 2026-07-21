import type { UserProfile, Product, CalculatorResult, ProductRec, CalcType } from '~/types'
import { isExternalStore } from './products'

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
  // Warmth class weighs every heat signal: body (sweating/temp), the room
  // itself, and which season the sleeper struggles in. Overheating wins on
  // conflict — a too-warm blanket disrupts sleep more than a too-cool one.
  const runsHot = profile.sweating === 'often' || profile.temp === 'hot'
    || profile.roomTemp === 'warm' || profile.problemSeason === 'summer'
  const runsCold = profile.temp === 'cold'
    || (profile.problemSeason === 'winter' && profile.roomTemp !== 'warm')
  if (runsHot) tags.push('cooling')
  else if (runsCold) tags.push('warming')
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
  if (profile.problemSeason === 'summer' && profile.sweating !== 'often') return 'Kerge ja hingav tekk lahendab just suvise ülekuumenemise — sinu kõige raskema uneaja.'
  if (profile.sweating === 'often' || profile.temp === 'hot' || profile.roomTemp === 'warm') return 'Bambus juhib niiskust ja soojust eemale — ärkad kuivalt ja värskena isegi soojas toas.'
  if (profile.temp === 'cold' || profile.problemSeason === 'winter') return 'Tihedam täidis hoiab vajaliku soojuse ka jahedamates tingimustes kogu öö.'
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

// 1–2 sentence Estonian recap of what the answers say about the sleeper and
// what matters most for them — shown before any product on the result screen.
function buildProfileSummary(profile: UserProfile, calcType: CalcType): string {
  const position: Record<string, string> = {
    side:    'magad enamasti küljel',
    back:    'magad enamasti selili',
    stomach: 'magad enamasti kõhuli',
    combo:   'magad vahelduvates asendites',
  }

  if (calcType === 'pillow') {
    const facts: string[] = [position[profile.position]]
    if (profile.bodyType === 'broad') facts.push('sul on laiemad õlad')
    if (profile.neckPain === 'often') facts.push('hommikune kaelavalu on sagedane')
    else if (profile.neckPain === 'sometimes') facts.push('kaelavalu esineb aeg-ajalt')
    if (profile.pillowCount === 'two-plus') facts.push('magad mitme padja peal')
    if (profile.pillowAge === '3y+') facts.push('sinu padi on üle kolme aasta vana')
    if (profile.allergies === 'dust-mites') facts.push('tolmulestad kimbutavad')

    const need = profile.neckPain !== 'never'
      ? 'õige kõrgusega padi, mis hoiab kaela neutraalses asendis'
      : profile.position === 'side'
        ? 'piisavalt kõrge tugi, mis täidab õla ja pea vahe'
        : profile.position === 'stomach'
          ? 'madal padi, mis ei suru kaela üles'
          : 'tugi, mis hoiab lülisamba loomulikus joones'
    return `Sina ${facts.join(', ')}. Sinu une jaoks on kõige olulisem ${need}.`
  }

  if (calcType === 'blanket') {
    const facts: string[] = []
    if (profile.sweating === 'often') facts.push('higistad öösiti sageli')
    else if (profile.sweating === 'sometimes') facts.push('higistad öösiti aeg-ajalt')
    if (profile.temp === 'hot') facts.push('magad pigem soojalt')
    else if (profile.temp === 'cold') facts.push('kipud öösiti külmetama')
    else if (!facts.length) facts.push('sinu kehatemperatuur on öösiti tasakaalus')
    if (profile.roomTemp === 'warm') facts.push('sinu magamistuba on pigem soe')
    else if (profile.roomTemp === 'cool') facts.push('magad jahedas toas')
    if (profile.problemSeason === 'summer') facts.push('suvi on sinu jaoks kõige raskem uneaeg')
    else if (profile.problemSeason === 'winter') facts.push('talvel on sul magamiseks liiga külm')
    if (profile.partner === 'shared') facts.push('jagad tekki partneriga')

    const need = (profile.sweating === 'often' || profile.temp === 'hot' || profile.roomTemp === 'warm' || profile.problemSeason === 'summer')
      ? 'hingav materjal, mis juhib niiskuse ja liigse soojuse kehast eemale'
      : (profile.temp === 'cold' || profile.problemSeason === 'winter')
        ? 'tekk, mis hoiab soojust ühtlaselt kogu öö'
        : 'aastaringselt tasakaalus temperatuur teki all'
    return `Sina ${facts.join(', ')}. Sinu une jaoks on kõige olulisem ${need}.`
  }

  // mattress
  const facts: string[] = [position[profile.position]]
  if (profile.sleepQuality === 'poor') facts.push('ärkad tihti väsinuna')
  if (profile.backPain === 'often') facts.push('hommikune seljavalu on sagedane')
  else if (profile.backPain === 'sometimes') facts.push('seljavalu esineb aeg-ajalt')
  if (profile.mattressAge === '5y+') facts.push('sinu madrats on üle viie aasta vana')
  if (profile.partner === 'shared') facts.push('jagad voodit partneriga')

  const need = profile.backPain !== 'never'
    ? 'madrats, mis toetab lülisammast neutraalses asendis'
    : profile.position === 'side'
      ? 'pehmem tsoonimine, mis vähendab survet õlgadele ja puusadele'
      : 'ühtlane tugi, mis kohandub sinu kehakujuga'
  return `Sina ${facts.join(', ')}. Sinu une jaoks on kõige olulisem ${need}.`
}

// Which calculator's answers can judge a product category. Categories without
// a calculator (pillowcases etc.) get no match figure at all.
const CATEGORY_CALC: Record<Product['category'], CalcType | null> = {
  pillow: 'pillow',
  blanket: 'blanket',
  mattress: 'mattress',
  pillowcase: null,
  duvetcover: null,
  sheet: null,
}

/**
 * Profile-fit percentage for the shop: how many of the profile's required
 * product attributes this product's tags cover. This is a statement about
 * ATTRIBUTE OVERLAP with the user's answers — deliberately not a promise
 * about sleep outcomes, which nobody can measure or guarantee.
 * Returns null when the relevant calculator hasn't been completed.
 */
export function productMatchPercent(
  product: Product,
  answersByCalc: Partial<Record<CalcType, Partial<UserProfile>>>,
): number | null {
  const calc = CATEGORY_CALC[product.category]
  if (!calc) return null
  const answers = answersByCalc[calc]
  if (!answers) return null

  const p = answers as UserProfile
  const required = calc === 'pillow'
    ? buildPillowTags(p)
    : calc === 'blanket'
      ? buildBlanketTags(p)
      : buildMattressTags(p)
  if (!required.length || !product.tags?.length) return null

  const hits = required.filter(tag => product.tags.includes(tag)).length
  return Math.round((hits / required.length) * 100)
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
    // Broken sleep / waking up tired signals the setup isn't doing its job
    if (profile.complaint === 'wake-at-night' || profile.complaint === 'wake-tired') score -= 3
    score = Math.max(20, Math.min(98, score))

    const goodShape = score >= 85
    const urgency: ProductRec['urgency'] = score >= 70 ? 'nice-to-have' : 'must-have'

    const required = buildPillowTags(profile)
    const sorted = [...active.filter(p => p.category === 'pillow')].sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
    const best = sorted[0] && scoreProduct(sorted[0], required) > 0 ? sorted[0] : undefined
    const recs: ProductRec[] = best
      ? [{ id: best.id, name: best.name, reason: pillowReason(profile, goodShape), urgency, category: 'pillow', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl, isExternal: isExternalStore(best.storeUrl) }]
      : []

    const tips: string[] = []
    if (profile.neckPain === 'often' || profile.neckPain === 'sometimes') tips.push('Kaelavalude vastu: kontrolli, kas padi toetab kaela — pärast 2–3 aastat kaotab enamik padju oma kuju.')
    if (profile.pillowAge === '3y+') tips.push('Sinu praegune padi on ilmselt oma elu ära elanud — üle 3 aasta vana padi ei toeta enam kaela korralikult.')
    if (profile.pillowCount === 'two-plus') tips.push('Kahe padja peal magamine viitab enamasti sellele, et padi on liiga madal — kael paindub terve öö ja lihased ei saa lõdvestuda.')
    if (profile.complaint === 'cant-sleep') tips.push('Uinumisraskuste vastu padi ei aita — kindel õhturutiin ja ekraanivaba tund enne und töötavad paremini kui ükski toode.')
    else if (profile.complaint === 'wake-at-night') tips.push('Öised ärkamised on sageli seotud magamiskeskkonnaga: pime, vaikne ja jahe (16–19 °C) tuba vähendab neid märgatavalt.')
    else if (profile.complaint === 'wake-tired') tips.push('Kui ärkad väsinuna, jälgi une regulaarsust — kõikuv uneaeg väsitab rohkem kui lühike, kuid ühtlane uni.')
    if (profile.age === 'senior') tips.push('Vanusega muutuvad liigesed ja kael tundlikumaks — õige kõrgusega tugi on veelgi olulisem kui nooremana.')
    if (profile.allergies === 'dust-mites') tips.push('Bambus on looduslikult tolmulestadele ebasoodne keskkond — tõhus valik tolmulesta-allergiaga magajale.')
    else if (profile.allergies === 'synthetic') tips.push('Bambus on naturaalne kiud — erineb täielikult sünteetilistest materjalidest ja sobib enamikule.')
    else if (profile.allergies === 'other') tips.push('Bambus on looduslikult hüpoallergeenne, kuid tundmatu allergia puhul soovitame enne ostu oma arsti käest küsida.')
    if (goodShape) tips.push('Sul pole praegu kiireloomulist vajadust. Kui valid uue padja, on bambus pikaajaline investeering une kvaliteeti.')

    const finalTips = fillTips(tips, ['Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.', 'Regulaarne unegraafik tugevdab keha sisekella paremini kui ükski lisand.'])
    const improvedScore = Math.min(98, score + calcImprovement(score))

    return { currentScore: score, improvedScore, profileSummary: buildProfileSummary(profile, calcType), recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
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
    // A warm bedroom plus anything but a light blanket compounds overheating
    if (profile.roomTemp === 'warm' && profile.blanketWeight !== 'light') score -= 5
    // A season where sleep reliably breaks down = the current blanket doesn't
    // adapt to that season
    if (profile.problemSeason === 'summer' || profile.problemSeason === 'winter') score -= 6
    // Thermoregulation weakens with age — being a cold sleeper hits harder
    if (profile.age === 'senior' && profile.temp === 'cold') score -= 3
    if (profile.allergies !== 'none') score -= 3
    score = Math.max(20, Math.min(98, score))

    const goodShape = score >= 85
    const urgency: ProductRec['urgency'] = (profile.sweating === 'often' || profile.temp === 'hot') ? 'must-have' : 'nice-to-have'

    const required = buildBlanketTags(profile)
    const sorted = [...active.filter(p => p.category === 'blanket')].sort((a, b) => scoreProduct(b, required) - scoreProduct(a, required))
    const best = sorted[0] && scoreProduct(sorted[0], required) > 0 ? sorted[0] : undefined
    const recs: ProductRec[] = best
      ? [{ id: best.id, name: best.name, reason: blanketReason(profile, goodShape), urgency, category: 'blanket', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl, isExternal: isExternalStore(best.storeUrl) }]
      : []

    const tips: string[] = []
    if (profile.roomTemp === 'warm') tips.push('Sinu magamistuba on une jaoks liiga soe — uuringute järgi on parim unetemperatuur 16–19 °C. Tuuluta enne magamaminekut või jäta aken irvakile.')
    else if (profile.sweating === 'often') tips.push('Ülekuumenemise vastu: hoia magamistuba 16–19 °C juures ja vali hingavad voodimaterjalid.')
    if (profile.problemSeason === 'summer') tips.push('Suvine unehäda on enamasti teki, mitte sinu süü — kerge suvetekk või ainult tekikott teeb kuumal ööl suure vahe.')
    else if (profile.problemSeason === 'winter') tips.push('Talvel aitab kihilisus: soojem tekk või tekk + õhem lisakiht, mida saab öö jooksul kohandada.')
    if (profile.partner === 'shared') tips.push('Eraldi tekid on lihtne viis mõlema partneri und parandada — kummalgi on oma temperatuurikontroll.')
    if (profile.age === 'senior' && profile.temp === 'cold') tips.push('Vanusega muutub keha temperatuuriregulatsioon nõrgemaks — soojust hoidev, aga hingav tekk on eriti oluline.')
    if (profile.temp === 'hot') tips.push('Bambus on üks hingavamaid looduslikke materjale — sobib ideaalselt soojasse magamistuppa.')
    if (profile.allergies === 'dust-mites') tips.push('Bambus on looduslikult tolmulestadele ebasoodne keskkond — tõhus valik tolmulesta-allergiaga magajale.')
    else if (profile.allergies === 'synthetic') tips.push('Bambus on naturaalne kiud — sobib enamikule sünteetikavastu tundlikele.')
    else if (profile.allergies === 'other') tips.push('Bambus on looduslikult hüpoallergeenne. Tundmatu allergia puhul soovitame enne ostu arsti käest küsida.')
    if (goodShape) tips.push('Sul pole praegu selgeid uneprobleeme. Uus tekk on mugavuse täiendus, mitte hädavajadus.')

    const finalTips = fillTips(tips, ['Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.', 'Bambusvoodipesu on hingavam kui puuvill ja sobib nii sooja- kui jahedamale magajale.'])
    const improvedScore = Math.min(98, score + calcImprovement(score))

    return { currentScore: score, improvedScore, profileSummary: buildProfileSummary(profile, calcType), recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
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
  const best = sorted[0] && scoreProduct(sorted[0], required) > 0 ? sorted[0] : undefined
  const recs: ProductRec[] = best
    ? [{ id: best.id, name: best.name, reason: mattressReason(profile, goodShape), urgency, category: 'mattress', linkUrl: best.storeUrl, priceText: best.priceText, imageUrl: best.imageUrl, isExternal: isExternalStore(best.storeUrl) }]
    : []

  const tips: string[] = []
  if (profile.backPain === 'often' || profile.backPain === 'sometimes') tips.push('Seljavalu ei kao kohe, kuid õige kõvadusega madrats vähendab lihaspingeid juba esimestel nädalatel.')
  if (profile.mattressAge === '5y+') tips.push('Sinu madrats on oma kasuliku eluea lõpus — üle 8 aasta vana madrats ei toesta enam lülisambat korralikult.')
  else if (profile.mattressAge === '3-5y') tips.push('5–8 aasta vanune madrats hakkab enamasti vajuma ja kaotab tasapisi oma toestamisvõime.')
  if (profile.currentMattress === 'spring' && (profile.mattressAge === '3-5y' || profile.mattressAge === '5y+')) tips.push('Vanema vedrumadratsi tüüpiline murekoht on keskosa vajumine — kontrolli, kas voodi keskele on tekkinud lohk.')
  else if (profile.currentMattress === 'foam' && (profile.bodyType === 'broad')) tips.push('Vahtmadrats vajub raskema keha all aja jooksul rohkem — tugevama tsoonitoega variant peab kauem vastu.')
  else if (profile.currentMattress === 'unknown') tips.push('Ei tea, mis madrats sul on? Vajuta keskele: vedrud annavad vetruva vastupanu, vaht vajub aeglaselt ja ühtlaselt.')
  if (profile.age === 'senior') tips.push('Vanemas eas suureneb survetundlikkus — pehmema pealiskihiga madrats vähendab öist keeramist ja tuimust.')
  if (goodShape) tips.push('Madrats on korras — kui mõtled vahetusele, tee seda siis, kui hakkad tundma esimesi ebamugavusi, mitte enne.')

  const finalTips = fillTips(tips, ['Madratsi vahetamise märgid: voodiservad vajuvad, hommikul tuimus või valu, keeruline mugavat asendit leida.', 'Hoia magamistuba jahedana (16–19 °C) — see on üks olulisimaid unekeskkonna tegureid.'])
  const improvedScore = Math.min(98, score + calcImprovement(score))

  return { currentScore: score, improvedScore, profileSummary: buildProfileSummary(profile, calcType), recommendations: recs, personalTips: finalTips.slice(0, 3), noUrgentNeed: goodShape }
}
