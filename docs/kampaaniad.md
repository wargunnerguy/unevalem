# Kampaaniad - Unevalemi reklaami- ja postitusraamat

> Estonian ad copy, English structure. Lives in the repo so campaign angles are
> versioned next to the pages they land on. When an angle changes, change it here
> and in the `pains` sheet tab together - the ad headline and the landing page
> headline must stay word-for-word identical.

---

## 1. The strategic frame

**The ad's job is attribution, not persuasion.** Estonians do not search for pillows.
They have a symptom - tired at 14:00, sore neck, awake at 3am - and they attribute it to
something else: stress, age, work, "I'm just a night owl". Every ad closes one attribution gap:

> You blame X. The mechanism is actually Y. Here is the number. Here is what to do.

**The moat is Estonian + rigorous.** There is no Estonian-language sleep authority. Everything
is either English or a webstore blog with no citations. The two existing articles prove the tone
works: `kohvi-ajastus-ja-uni` explains caffeine half-life and CYP1A2 variation with a PubMed
citation, and `alkohol-ja-uni` says plainly that the effect size "on uuringutes endiselt
vastuoluline". Keep that. It is rare and it is defensible.

**Honesty is the marketing.** In a feed full of dropshippers, an ad that says "the thing that
matters is the height, and if you find it cheaper elsewhere, buy it there" is genuinely
startling. Run it as a real ad, not just a footer line.

**Standing line in every ad: "Tasuta. E-posti ei küsi."** This is true today - the calculator
and the quiz gate nothing - and it must stay true. The newsletter is offered *after* the result,
never in front of it. It is the single strongest CTR line available, because every competing quiz
ad in the feed gates its result.

---

## 2. Hard rule on claims

**Every number in an ad or post must trace to a row in the `sources` sheet tab.**

The brand is "teaduspõhine". One invented statistic destroys it, and the fabricated social-proof
notifications that had to be pulled before this campaign show the failure mode is real, not
theoretical. Figures below marked `[VAJAB ALLIKAT]` must get a citation or be cut before the ad
runs. No exceptions, including for claims that "everyone knows".

Watch specifically for **prevalence claims** - "most people", "enamik" - which sound modest but
are exactly the kind of statistic nobody has actually measured for Estonia.

---

## 3. Pain inventory → landing page → what exists

| # | Pain (as they experience it) | They blame | Actual mechanism | Landing | Status |
|---|---|---|---|---|---|
| 1 | Kaela-/õlavalu hommikul | asend, vanus, arvutitöö | padja kõrgus vs õlgade laius | `/probleem/kaelavalu-hommikul` | ✅ **valmis** |
| 2 | Ärkan kell 3, uni ei tule tagasi | stress | alkohol / REM-taastärge / temperatuur | `/probleem/arkan-kolm-oosel` | ✅ **valmis** |
| 3 | Higistan öösel | "olen lihtsalt soe inimene" | teki soojusregulatsioon | `/probleem/higistan-oosel` | ✅ **valmis** |
| 4 | Ei saa uinuda, "olen öökull" | iseloom | kronotüüp vs graafik | `/unetest` | ✅ **valmis** |
| 5 | Kell 14 kokkuvarisemine | lõuna | tsirkadiaanne madalseis + unevõlg + kofeiin | artikkel `kohvi-ajastus-ja-uni` | ✅ artikkel |
| 6 | Magan 8 h, ärkan väsinuna | "vajan rohkem und" | katkendlik uni, toa temp, hiline kofeiin | `/probleem/arkan-vasinuna` | ❌ lisa `pains` reale |
| 7 | Teki sõda partneriga | partner | liikumise ülekanne, jagatud tekk | `/probleem/teki-soda` | ❌ lisa `pains` reale |
| 8 | Talvine pimedus / kaamos | "talvedepressioon" | valgussignaali puudumine 59° laiuskraadil | hooajaline artikkel + pain | ❌ artikkel |
| 9 | Valged ööd juunis | - | valgus läbi silmalaugude, melatoniin | hooajaline artikkel + pain | ❌ artikkel |
| 10 | Vahetustega töö | "harjumatus" | tsirkadiaanne nihe | artikkel + pain | ❌ artikkel |

**Ads 1, 2, 3 and 4 can run today** - their landing surfaces exist. Start there while the rest
get written. Adding a new pain page is a row in the `pains` tab; no developer needed.

---

## 4. Meta ad drafts

**Format: static image or 6-12 s text-on-screen video, no product visible.** A product-free ad
for a product-free funnel. Show a pillow and you get low CTR and high bounce, because the
landing page does not sell one.

**Structure:** symptom in their words → the wrong attribution → reframe with a number → CTA.

---

### AD 1 - Kaelavalu *(pain 1 · best commercial fit · run first)*

> Ärkad hommikul kaela- või õlavaluga?
>
> Enamik inimesi süüdistab magamisasendit.
>
> Sagedasem põhjus on paar sentimeetrit padja kõrguses. Külili magades peab padi täitma õla ja
> kõrva vahe. Liiga madal kallutab kaela alla, liiga kõrge üles - kumbki ei lase kaelalihastel
> öösel lõdvestuda.
>
> 8 küsimust ütlevad, milline kõrgus sinu õlgade laiusele vastab.
>
> Tasuta. E-posti ei küsi. → **Vaata oma unevalemit**

→ `/probleem/kaelavalu-hommikul` · prefill `neckPain:often`

---

### AD 2 - Kell 3 öösel *(pain 2 · article exists · run immediately)*

> Uinud kiiresti. Ärkad kell 3. Uni ei tule tagasi.
>
> Kui õhtul oli klaas veini, pole see juhus.
>
> Alkohol kiirendab uinumist ja süvendab öö esimest poolt - see osa on tõsi. Aga kui keha selle
> lagundab, pöördub mõju ümber: REM-uni väheneb, ärkamised sagenevad. 2024. aasta ülevaade 27
> uuringust: juba kaks standardjooki annavad mõõdetava efekti.
>
> → **Loe, mis öö teises pooles päriselt juhtub**

→ `/probleem/arkan-kolm-oosel` · ⚠️ the "27 uuringut / kaks standardjooki" figures must be in the
`sources` tab under `alkohol-ja-uni` before this runs.

---

### AD 3 - Kohv *(pain 5 · article exists)*

> Kohv kell 15.00 on kell 23.00 endiselt sinu veres.
>
> Kofeiini poolestusaeg on 5-6 tundi. Mõnel kuni 10 - vahe tuleb ühest maksaensüümist (CYP1A2).
>
> Uuringus lühendas 400 mg kofeiini kuus tundi enne magamaminekut ööund tunni võrra. Katseisikud
> ise ei tundnud, et miski segaks.
>
> "Mulle kohv ei mõju" võib erksuse kohta olla tõsi. Une ehituse kohta mitte.
>
> → **Loe artiklit**

→ `/artiklid/kohvi-ajastus-ja-uni` (already cited)

---

### AD 4 - Unetest *(pain 4 · highest share potential · the organic engine)*

> "Ma olen lihtsalt öökull."
>
> Võib-olla. Aga kronotüüp ei ole iseloomujoon - see on bioloogia, ja seda saab mõõta.
>
> 8 küsimust ütlevad, kas oled lõoke, öökull või midagi vahepealset. Ja millal on sinu keha jaoks
> päriselt õige aeg magama minna.
>
> Tasuta. E-posti ei küsi. → **Tee unetest**

→ `/unetest`

---

### AD 5 - Higistamine *(pain 3)*

> Higistad öösel ja arvad, et oled lihtsalt soe inimene?
>
> Keha temperatuur peab õhtul langema - see langus on üks tugevamaid uinumissignaale. Tekk, mis
> soojust kinni hoiab, töötab selle vastu.
>
> Tähtis ei ole teki paksus, vaid see, kui hästi ta soojust ja niiskust läbi laseb.
>
> → **Vaata, milline tekk sulle sobib**

→ `/probleem/higistan-oosel` · prefill `sweating:often;temp:hot`

---

### AD 6 - Teki sõda *(pain 7 · highest comment rate)*

> Kaks inimest, üks tekk, üks öö.
>
> Iga kord, kui teine end pöörab või tekki tõmbab, tõuseb sinu uni sügavast faasist kergesse.
> Sa ei ärka - aga hommikuks on sügavat und vähem. `[VAJAB ALLIKAT: liikumishäirete arv öös]`
>
> Skandinaavias on kaks eraldi tekki normaalsus, mitte suhtekriis.
>
> → **Vaata, milline tekk sulle sobib**

→ needs a `pains` row `teki-soda` · prefill `partner:shared`

---

### AD 7 - Ausus *(brand + retargeting · run continuously at low budget)*

> Me müüme patju. Ja ütleme ausalt: uut patja ei pruugi sul üldse vaja olla.
>
> Vaja on õiget kõrgust. Padi peab täitma õla ja kõrva vahe - see on sentimeetrite küsimus, mitte
> brändi või hinna oma. Selle võib lahendada su praegune padi teisiti volditud, kahekümne-eurone
> pood või meie oma. Meile sobib iga variant.
>
> Unevalem on eestikeelne uneteadmiste koht. Kalkulaator on tasuta, e-posti me ei küsi, ja kui
> leiad odavama koha, osta sealt.
>
> → **Vaata, mis sulle sobib**

⚠️ **Changed from the original draft, deliberately.** The draft said "enamikul inimestel pole uut
patja vaja" - an unsourced prevalence claim, exactly what rule 2 exists to catch. The version
above makes the same startling point using only what is defensible: the variable that matters is
pillow height (loft) matching shoulder width and sleeping position. If a source for the
prevalence claim turns up, the stronger wording can come back. Until then it stays out.

This ad and the funnel must agree: it promises height matched to your build, and the pillow
calculator's `bodyType` and `position` steps are what make that true on arrival. If those steps
ever change, this ad changes with them.

---

### AD 8 - Kaamos *(pain 8 · seasonal Nov-Feb · the Estonian moat)*

> Detsembris on Tallinnas päevavalgust alla 6 tunni.
>
> Sinu sisemine kell ei käi kalendri, vaid valguse järgi. Kui ärkad pimedas ja jõuad koju pimedas,
> ei saa keha signaali, millal päev algas - ja melatoniini vabanemine nihkub.
>
> See pole laiskus. See on ajastus.
>
> → **Loe, kuidas pimedal hommikul keha äratada**

`[VAJAB ALLIKAT: Tallinna päevavalguse tunnid detsembris]` - trivially sourceable, but source it.

---

### AD 9 - Valged ööd *(pain 9 · seasonal May-July)*

> Juunis Eestis päike õieti ei loojugi.
>
> Ja sinu keha märkab seda ka läbi suletud silmalaugude.
>
> → **Kuidas magada, kui väljas on valge**

---

### AD 10 - Saun *(Estonian, seasonal-agnostic)*

> Saun ei aja und ära. Saun toob und.
>
> Kehatemperatuuri langus pärast soojenemist on üks tugevamaid uinumissignaale. Trikk on
> ajastuses: umbes 90 minutit enne magamaminekut, mitte vahetult enne. `[VAJAB ALLIKAT]`
>
> → **Loe, miks soojus jahutab**

---

### AD 11 - Vahetustega töö *(pain 10 · underserved, very loyal segment)*

> Vahetustega töö ei ole harjumise küsimus.
>
> Sinu sisemine kell ei kohane graafikuga - see kohaneb valgusega. Sellepärast tundub viies
> öövahetus sama raske kui esimene.
>
> → **Loe, mida saab päriselt teha**

---

### Testing plan

Run **ads 1, 2 and 4 first** - all three have their landing surface ready. One creative per ad
set, same audience, small budget.

**Judge on cost-per-`lead` and calculator completion rate, not CTR.** Optimise the Meta campaign
toward `Lead`, never `Purchase`: nothing is purchasable yet, so a Purchase-optimised campaign
never leaves the learning phase.

Check `utm_campaign` in the `pillow_responses` / `blanket_responses` / `subscribers` sheet tabs -
that is the reliable record. The pixel will always show fewer conversions, because a large share
of EU visitors decline advertising consent. **Do not try to reconcile the two numbers.**

---

## 5. Organic post pillars

A fixed weekly rhythm, so posting never requires a decision.

| Day | Format | Source of material |
|---|---|---|
| **Mon** | **MÜÜT** - myth → correction → source | list below; each also becomes an article |
| **Wed** | **ÜKS NUMBER** - one striking figure + 2-sentence mechanism | the `sources` sheet tab |
| **Fri** | **UNENIPP** - one practical tip | the `tips` sheet tab, already written |
| Monthly | **EESTI OMA** - seasonal/local | kaamos, valged ööd, saun, jaanipäev, kellakeeramine |

The Friday slot is essentially free: the `tips` tab already holds a large stock of proofread
Estonian tips, currently driving only the homepage daily-tip card. Wednesday is free too, once
the `sources` tab fills up.

### The MÜÜT format is built and unused

`composables/usePosts.ts` strips a `MÜÜT: ` title prefix and sets `isMyth`; the article page
renders a `✕ MÜÜT` badge. **Zero posts use it.** Myth → correction is the most shareable format
there is, it needs no new code, and each social post maps 1:1 to an article.

The blog listing now has a **"Müüdid"** filter tab that cuts across the normal categories, so the
myth posts form one browsable cluster to point ads and social posts at.

Ten to write:

1. MÜÜT: Saan hakkama viie tunni unega
2. MÜÜT: Alkohol aitab magada *(article exists - just retitle)*
3. MÜÜT: Nädalavahetusel saab une tagasi magada
4. MÜÜT: Vanemad inimesed vajavad vähem und
5. MÜÜT: Kõva madrats on seljale parem
6. MÜÜT: Norskamine on kahjutu
7. MÜÜT: Telefon enne und ei sega, kui öörežiim on peal
8. MÜÜT: Mulle kohv ei mõju *(article exists - retitle)*
9. MÜÜT: Kui und ei tule, jää voodisse ja proovi edasi
10. MÜÜT: Uinak rikub öise une

Two are retitles of existing posts, so the cluster starts at 2 for free.

---

## 6. Google Search

Low Estonian volume, high intent. Send traffic to `/probleem/*` and the calculator -
**never to `/pood`**, which is currently a wall of waitlist forms.

Starter keywords: `milline padi kaelavalu`, `kõrge padi külili magajale`, `miks ärkan öösel kell
3`, `kronotüüp test eesti`, `bambustekk`, `mitu tundi und vaja`.

Google Ads conversion import needs advertising consent to be grantable - that shipped with the
consent v2 banner. Expect partial coverage; the sheet is the fuller record.

---

## 7. Facebook groups

Free, high-trust, and the best fit for the existing tone. Estonian parenting, health, shift-work
and fitness groups.

**Rule: never post a bare link.** Post the full answer as a comment or post; link only as the
source at the end. The tips and the myth posts are exactly the right shape for this.

The blocker here is article count, not effort.

---

## 8. Checking that Google Analytics actually works

**Realtime being empty is usually not a bug.** It shows only the last 30 minutes. A site with no
campaigns running has no concurrent visitors, so Realtime is empty almost all the time while the
standard reports still accumulate data over days. Use **DebugView**, not Realtime, to answer
"is the tag alive?".

Two-minute check:

1. Open the site in a **private window with no ad blocker**. uBlock, Brave, AdGuard and Safari's
   tracking protection all block `googletagmanager.com` outright, and then nothing is sent at all.
2. Add `?ga_debug=1` to the URL - e.g. `https://unevalem.ee/?ga_debug=1`. This sets gtag's
   `debug_mode`.
3. In GA4 go to **Admin → DebugView**.
4. Accept cookies on the banner.
5. You should appear within seconds with a `page_view`. Open it and check `page_title` matches
   the page you are actually on.
6. Click through to an article and confirm the second `page_view` carries *that* page's title.

If DebugView shows events but Realtime stays empty, everything works - there is simply no live
traffic yet. If DebugView shows nothing at all, the tag is being blocked before it loads; check
the measurement ID against **Admin → Data streams**.

**One more thing to know:** if you ever clicked "Keeldun" on the old cookie banner, that stored a
refusal for a full year and your own visits were sent without analytics storage, which keeps you
out of Realtime. The consent rework uses a new cookie, so that old choice is discarded and you
will be asked again - but clearing site data for unevalem.ee resolves it instantly.

---

## 9. Before the first euro is spent

- [ ] Deactivate every fabricated row in the `notifications` sheet tab. The toast is unmounted in
      code, so this is belt-and-braces - but do it, because the component comes back one day.
- [ ] Delete the stale English demo rows in the `stats` tab.
- [ ] Check `calculatorCompletions.active` is not the string `"TRUE "` with a trailing space -
      `fetch-content.ts` compares without trimming, so that reads as inactive.
- [ ] Create the `pains` tab with the three launch rows (see `public/data/pains.example.json`).
- [ ] Put every figure marked `[VAJAB ALLIKAT]` above into the `sources` tab, or cut the line.
- [ ] Set `NUXT_PUBLIC_META_PIXEL_ID` as a repo variable and wire it into `deploy.yml`.
- [ ] Verify a test sign-up lands in `subscribers` with consent text and UTMs.
- [ ] Confirm `${SHEETS_API_URL}?sheet=subscribers` returns `{"error":"Unknown sheet: subscribers"}`.
