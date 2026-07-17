// All Estonian UI strings. Never hardcode copy in .vue files — import from here.

export const nav = {
  home: 'Avaleht',
  articles: 'Artiklid',
  quiz: 'Unetest',
  shop: 'Pood',
  logo: 'Unevalem',
  tagline: 'Sinu isiklik unevalem',
}

export const common = {
  back: 'Tagasi',
  next: 'Edasi',
  loading: 'Laen...',
  error: 'Viga andmete laadimisel',
  retry: 'Proovi uuesti',
  copyLink: 'Kopeeri link',
  linkCopied: 'Link kopeeritud!',
  readMore: 'Loe edasi',
  allArticles: 'Loe kõiki artikleid →',
  popularBadge: 'Populaarne',
  minutesShort: 'min',
  justNow:      'just äsja',
  minutesAgo:   'minutit tagasi',
  hoursAgo:     'tundi tagasi',
  daysAgo:      'päeva tagasi',
}

export const calculator = {
  version: 'v2.5',
  heroLabel: 'Leia oma ideaalne padi, tekk ja madrats — 3 lühikest testi',

  heroTitle: {
    pillow:   'Leia endale parim padi',
    blanket:  'Leia endale parim tekk',
    mattress: 'Leia endale parim madrats',
  } as Record<string, string>,

  researchBadge: 'Soovitustest põhineb 60+ rahvusvahelisel uneuuringul',
  researchResultNote: 'Soovitus on koostatud teadusuuringute põhjal.',

  variantLabels: {
    pillow:  'Leia oma ideaalne padi — alusta siit',
    blanket: 'Leia oma ideaalne tekk — alusta siit',
    sleep:   'Ehita oma täielik une profiil — 3 testi',
  } as Record<string, string>,
  progressLabel: (step: number, total: number) => `Samm ${step} / ${total}`,
  timeLeft: (step: number, total: number): string => {
    const sek = (total + 1 - step) * 20
    if (sek >= 60) return `~${Math.ceil(sek / 60)} min`
    if (sek > 0) return `~${sek} sek`
    return ''
  },

  configs: {
    pillow: {
      icon: '🛏️',
      title: 'Padi',
      description: 'Leia täpselt sulle sobiv padi',
      stepKeys: ['neckPain', 'position', 'bodyType', 'age', 'complaint', 'pillowCount', 'allergies', 'pillowAge'] as const,
      steps: [
        {
          question: 'Kas ärkad hommikul kaela- või õlavaluga?',
          options: [
            { label: 'Jah, sageli', value: 'often' },
            { label: 'Mõnikord', value: 'sometimes' },
            { label: 'Ei, ärkan valutu', value: 'never' },
          ],
        },
        {
          question: 'Kuidas sa üldjuhul magad?',
          options: [
            { label: 'Küljel', value: 'side' },
            { label: 'Selili', value: 'back' },
            { label: 'Kõhuli', value: 'stomach' },
            { label: 'Vahelduvalt', value: 'combo' },
          ],
        },
        {
          question: 'Milline on sinu kehaehitus?',
          options: [
            { label: 'Peenike / kitsaste õlgadega', value: 'slim' },
            { label: 'Keskmine', value: 'medium' },
            { label: 'Tugevam / laiade õlgadega', value: 'broad' },
          ],
        },
        {
          question: 'Kui vana sa oled?',
          options: [
            { label: '18–30', value: 'young' },
            { label: '31–45', value: 'adult' },
            { label: '46–60', value: 'middle' },
            { label: '60+', value: 'senior' },
          ],
        },
        {
          question: 'Mis häirib sind une osas kõige rohkem?',
          options: [
            { label: 'Raske uinuda', value: 'cant-sleep' },
            { label: 'Ärkan öösel üles', value: 'wake-at-night' },
            { label: 'Ärkan väsinuna', value: 'wake-tired' },
            { label: 'Pole erilisi probleeme', value: 'none' },
          ],
        },
        {
          question: 'Mitu patja kasutad korraga?',
          options: [
            { label: 'Ühte patja', value: 'one' },
            { label: 'Kahte või rohkem', value: 'two-plus' },
          ],
        },
        {
          question: 'Kas sul esineb allergia või tundlikkus?',
          options: [
            { label: 'Tolmulestade suhtes', value: 'dust-mites' },
            { label: 'Sünteetiliste materjalide suhtes', value: 'synthetic' },
            { label: 'Muu allergia või tundlikkus', value: 'other' },
            { label: 'Pole teadaolevaid allergiaid', value: 'none' },
          ],
        },
        {
          question: 'Kui vana on sinu praegune padi?',
          options: [
            { label: 'Uus (alla 1 aasta)', value: 'new' },
            { label: '1–3 aastat vana', value: '1-3y' },
            { label: 'Üle 3 aasta vana', value: '3y+' },
          ],
        },
      ],
    },
    blanket: {
      icon: '🌙',
      title: 'Tekk',
      description: 'Leia täpselt sulle sobiv tekk',
      stepKeys: ['sweating', 'temp', 'age', 'blanketWeight', 'partner', 'roomTemp', 'allergies', 'problemSeason'] as const,
      steps: [
        {
          question: 'Kas higistab öösel või ärkad kuumalt?',
          options: [
            { label: 'Jah, sageli', value: 'often' },
            { label: 'Mõnikord', value: 'sometimes' },
            { label: 'Harva', value: 'rarely' },
          ],
        },
        {
          question: 'Milline temperatuur sobib sulle magamiseks?',
          options: [
            { label: 'Jahe tuba (16–18 °C)', value: 'cold' },
            { label: 'Mugav (18–20 °C)', value: 'normal' },
            { label: 'Soe tuba (20 °C+)', value: 'hot' },
          ],
        },
        {
          question: 'Kui vana sa oled?',
          options: [
            { label: '18–30', value: 'young' },
            { label: '31–45', value: 'adult' },
            { label: '46–60', value: 'middle' },
            { label: '60+', value: 'senior' },
          ],
        },
        {
          question: 'Millist teki kaalu eelistad?',
          options: [
            { label: 'Kerget — tahan vaid kerget puudutust', value: 'light' },
            { label: 'Keskmist — normaalne soojus', value: 'medium' },
            { label: 'Rasket ja soojemat', value: 'heavy' },
          ],
        },
        {
          question: 'Kas magad üksi või koos partneriga?',
          options: [
            { label: 'Üksi', value: 'solo' },
            { label: 'Koos — jagame tekki', value: 'shared' },
            { label: 'Koos — eraldi tekid', value: 'separate' },
          ],
        },
        {
          question: 'Milline on sinu magamistoa tavatemperatuur?',
          options: [
            { label: 'Pigem jahe', value: 'cool' },
            { label: 'Keskmiselt soe', value: 'moderate' },
            { label: 'Pigem soe', value: 'warm' },
          ],
        },
        {
          question: 'Kas sul esineb allergia või tundlikkus?',
          options: [
            { label: 'Tolmulestade suhtes', value: 'dust-mites' },
            { label: 'Sünteetiliste materjalide suhtes', value: 'synthetic' },
            { label: 'Muu allergia või tundlikkus', value: 'other' },
            { label: 'Pole teadaolevaid allergiaid', value: 'none' },
          ],
        },
        {
          question: 'Mis aastaajal on sul kõige rohkem uneprobleeme?',
          options: [
            { label: 'Talvel — on liiga külm', value: 'winter' },
            { label: 'Suvel — on liiga palav', value: 'summer' },
            { label: 'Aastaringselt ühtlaselt', value: 'year-round' },
          ],
        },
      ],
    },
    mattress: {
      icon: '💤',
      title: 'Madrats',
      description: 'Leia täpselt sulle sobiv madrats',
      stepKeys: ['sleepQuality', 'position', 'bodyType', 'backPain', 'age', 'partner', 'mattressAge', 'currentMattress'] as const,
      steps: [
        {
          question: 'Kuidas hindad oma praegust une kvaliteeti?',
          options: [
            { label: 'Halb — ärkan väsinuna', value: 'poor' },
            { label: 'Keskpärane — võiks parem olla', value: 'fair' },
            { label: 'Hea — ärkan puhanuna', value: 'good' },
          ],
        },
        {
          question: 'Kuidas sa üldjuhul magad?',
          options: [
            { label: 'Küljel', value: 'side' },
            { label: 'Selili', value: 'back' },
            { label: 'Kõhuli', value: 'stomach' },
            { label: 'Vahelduvalt', value: 'combo' },
          ],
        },
        {
          question: 'Milline on sinu kehaehitus / kaal?',
          options: [
            { label: 'Kerge (alla 65 kg)', value: 'slim' },
            { label: 'Keskmine (65–90 kg)', value: 'medium' },
            { label: 'Raskem (üle 90 kg)', value: 'broad' },
          ],
        },
        {
          question: 'Kas ärkad hommikul seljavaluga?',
          options: [
            { label: 'Jah, sageli', value: 'often' },
            { label: 'Mõnikord', value: 'sometimes' },
            { label: 'Ei', value: 'never' },
          ],
        },
        {
          question: 'Kui vana sa oled?',
          options: [
            { label: '18–30', value: 'young' },
            { label: '31–45', value: 'adult' },
            { label: '46–60', value: 'middle' },
            { label: '60+', value: 'senior' },
          ],
        },
        {
          question: 'Kas magad üksi või koos partneriga?',
          options: [
            { label: 'Üksi', value: 'solo' },
            { label: 'Koos', value: 'shared' },
          ],
        },
        {
          question: 'Kui vana on sinu praegune madrats?',
          options: [
            { label: 'Uus (alla 2 aasta)', value: 'new' },
            { label: '2–5 aastat', value: '1-3y' },
            { label: '5–8 aastat', value: '3-5y' },
            { label: 'Üle 8 aasta', value: '5y+' },
          ],
        },
        {
          question: 'Millist madratsit kasutad praegu?',
          options: [
            { label: 'Vedrumadratsit', value: 'spring' },
            { label: 'Vahtmadratsit', value: 'foam' },
            { label: 'Hübriidmadratsit', value: 'hybrid' },
            { label: 'Ei tea / ei ole kindel', value: 'unknown' },
          ],
        },
      ],
    },
  } as const,

  session: {
    profileHeading: 'Sinu une profiil',
    progressOf: (done: number, total: number) => `${done}/${total} kalkulaatorit tehtud`,
    doneAll: 'Kõik kolm kalkulaatorit tehtud!',
    nextCalcLabel: {
      pillow:   'Järgmisena: leia oma ideaalne tekk',
      blanket:  'Järgmisena: leia oma ideaalne madrats',
      mattress: 'Järgmisena: leia oma ideaalne padi',
    } as Record<string, string>,
    nextCalcBtn: {
      pillow:   'Alusta tekikülkulaatoriga →',
      blanket:  'Alusta madratsikülkulaatoriga →',
      mattress: 'Alusta padjakülkulaatoriga →',
    } as Record<string, string>,
    doneLabel: {
      pillow:   'Padi',
      blanket:  'Tekk',
      mattress: 'Madrats',
    } as Record<string, string>,
    redoButton: 'Tee test uuesti',
  },

  result: {
    currentScoreLabel: 'Sinu praegune uneskoor',
    improvedScoreLabel: 'Pärast muutusi',
    scoreUnit: '/ 100',
    resultHeadings: {
      pillow:   'Sinu ideaalne padi',
      blanket:  'Sinu ideaalne tekk',
      mattress: 'Sinu ideaalne madrats',
    } as Record<string, string>,
    tipsHeading: 'Isiklikud unenõuanded',
    profileHeading: 'Sinu uneprofiil',
    productsHeading: 'Sinu profiiliga sobivad tooted',
    productsIntro: 'Kui otsustad midagi uuendada, siis need sobivad sinu vastuste põhjal:',
    ctaButton: 'Vaata kõiki tooteid →',
    mustHaveBadge: 'Oluline',
    niceToHaveBadge: 'Kasulik',
    noUrgentNeedMessage: 'Sul pole praegu kiireloomulist vajadust — aga saad alati edasi täiustada.',
  },
}

export const shop = {
  addToCart: 'Lisa korvi',
  notifyMe: 'Anna teada, kui saadaval',
  notifyPlaceholder: 'sinu@email.ee',
  notifySubmit: 'Anna teada',
  notifyConfirm: 'Kirjas! Anname teada, kui toode on saadaval.',
  notifyError: 'Midagi läks valesti — proovi hetke pärast uuesti.',
  // GDPR: waitlist stores only the address + product, nothing else.
  notifyGdpr: 'Kasutame sinu e-posti ainult selle toote saadavusteate saatmiseks.',
  notifyGdprLink: 'Privaatsuspoliitika',

  cart: {
    heading: 'Ostukorv',
    empty: 'Sinu ostukorv on tühi.',
    emptyCta: 'Vaata tooteid →',
    subtotal: 'Kokku',
    checkout: 'Vormista tellimus',
    remove: 'Eemalda',
    close: 'Sulge',
    ariaOpen: 'Ava ostukorv',
  },

  checkout: {
    metaTitle: 'Tellimuse vormistamine | Unevalem',
    heading: 'Vormista tellimus',
    itemsHeading: 'Sinu tellimus',
    name: 'Nimi',
    email: 'E-post',
    phone: 'Telefon',
    shippingHeading: 'Tarneviis',
    carriers: { omniva: 'Omniva pakiautomaat', smartpost: 'SmartPost pakiautomaat' } as Record<string, string>,
    terminalLabel: 'Vali pakiautomaat',
    terminalLoading: 'Laen pakiautomaate…',
    note: 'Märkus (valikuline)',
    gdpr: 'Kasutame sinu andmeid ainult selle tellimuse täitmiseks ja tarneks.',
    submit: 'Jätka maksma →',
    submitting: 'Saadan tellimust…',
    error: 'Tellimuse loomine ebaõnnestus — proovi uuesti või kirjuta meile.',
    emptyCart: 'Sinu ostukorv on tühi — vali kõigepealt tooted.',
    required: 'Täida kõik kohustuslikud väljad.',
  },

  thanks: {
    metaTitle: 'Aitäh! | Unevalem',
    heading: 'Aitäh! Sinu tellimus on kirjas.',
    paid: 'Makse on kinnitatud. Saadame sulle e-postiga tellimuse kinnituse.',
    pending: 'Ootame maksekinnitust — see võib võtta mõne minuti. Värskenda lehte või kontrolli hiljem e-posti.',
    failed: 'Makse ei õnnestunud või katkestati. Kui see on eksitus, proovi uuesti või kirjuta meile.',
    delivery: 'Tarne: 2–5 tööpäeva jooksul pärast makse kinnitust.',
    orderRefLabel: 'Tellimuse number',
    backHome: 'Tagasi avalehele →',
  },
}

// Transparency: shown at every surface that recommends products.
export const disclosure = {
  short: 'Aus märkus: osa soovitatud toodetest müüb Unevalem ise, osa viib välistesse poodidesse. Soovitused põhinevad sinu vastustel, mitte müügihuvil.',
  linkLabel: 'Loe, kuidas Unevalem end rahastab →',
  ownBadge: 'Unevalemi toode',
  externalBadge: 'Väline pood',
}

export const blogCategories = {
  all: 'Kõik',
  teadus: 'Teadus',
  nõuanded: 'Nõuanded',
  tooted: 'Tooted',
  uneaeg: 'Uneaeg',
}

export const blogPage = {
  heading: 'Uneblog',
  metaTitle: 'Uneblog – unenõuanded ja teadus | Unevalem',
  metaDescription: 'Loe artikleid une teadusest, praktilisi nõuandeid ja tooteinfot. Kõik, mida pead teadma parema une jaoks.',
  relatedHeading: 'Seotud artiklid',
  diveDeeperHeading: 'Uuri lähemalt',
  sourceLabel: 'Allikas',
  emptyCategory: 'Selles kategoorias pole veel artikleid.',
  notFound: 'Artiklit ei leitud.',
  share: {
    heading: 'Jaga artiklit',
    facebook: 'Jaga Facebookis',
    copyLink: 'Kopeeri link',
  },
  readingTime: (min: number) => `${min} min lugemine`,
}

export const homepage = {
  metaTitle: 'Unevalem – Leia oma personaalne unelahendus',
  metaDescription: 'Vasta 5 küsimusele ja saad personaalse soovituse parema une jaoks. Eesti parim unenõuannete ressurss.',
  dailyTipHeading: 'Päeva unenipp',
  featuredPostsHeading: 'Populaarseimad artiklid',
  personalizedNote: 'Sinu vastuste põhjal',

  // Value claims strip: three honest reasons to trust the site — replaces the
  // old fabricated visitor/reader counters. Static copy, nothing from Sheets.
  valueClaims: [
    { title: 'Teaduspõhine', text: 'Soovitused põhinevad rahvusvahelistel uneuuringutel' },
    { title: 'Eesti oma',    text: 'Eesti keeles ja Eesti magajatele loodud' },
    { title: 'Tasuta',       text: 'Kõik testid ja nõuanded on täiesti tasuta' },
  ],
}

export const quizPage = {
  heading: 'Unetest',
  metaTitle: 'Unetest – mis tüüpi magaja sa oled? | Unevalem',
  metaDescription: 'Testi oma uneteadmisi ja avasta oma unetüüp. Interaktiivsed unetestid parema une nimel.',
  backToQuizzes: 'Tagasi viktoriinide juurde',
  shareResult: 'Minu unetüüp',
  tryCalculator: 'Proovi ka Unevalemit →',
  eyebrow: 'Unetest',
  startButton: 'Alusta unetesti →',
  resultLabel: 'Sinu tulemus',
  restartButton: 'Alusta uuesti',
  loading: 'Laen unetesti...',
  empty: 'Unetest pole hetkel saadaval.',
}

export const socialProof = {
  typeIcons: {
    purchase: '🛍️',
    view: '👁️',
    quiz: '🎯',
  },
}

export const cookieConsent = {
  text: 'Kasutame analüütikat, et mõista, kuidas lehte kasutatakse, ja seda paremaks muuta. Võid soovi korral keelduda.',
  accept: 'Selge',
  decline: 'Keeldun',
  learnMore: 'Loe lähemalt',
}

export const privacyPage = {
  metaTitle: 'Privaatsuspoliitika | Unevalem',
  metaDescription: 'Kuidas Unevalem kogub ja kasutab andmeid ning milliseid küpsiseid kasutame.',
  heading: 'Privaatsuspoliitika',
  lastUpdated: 'Viimati uuendatud: 13. juuli 2026',
  intro:
    'Sinu privaatsus on meile oluline. Siin selgitame lihtsalt ja ausalt, milliseid andmeid Unevalem kogub, miks ja kuidas saad seda ise kontrollida.',
  sections: [
    {
      heading: 'Milliseid andmeid kogume',
      body: 'Unevalem ei küsi ega salvesta sinu nime, e-posti ega muid isikut tuvastavaid andmeid. Kogume ainult anonüümset statistikat lehe kasutuse kohta ning sinu unekalkulaatori vastuseid, et anda personaalseid soovitusi.',
      items: [
        'Kalkulaatori vastused (nt magamisasend, temperatuurieelistus) — hoitakse sinu seadmes küpsistes ja saadetakse meile üksnes anonüümselt koondstatistikana.',
        'Anonüümne külastusstatistika — milliseid lehti vaadatakse ja kust külastajad tulevad.',
      ],
    },
    {
      heading: 'Küpsised',
      body: 'Küpsis on väike tekstifail sinu seadmes. Kasutame kahte tüüpi küpsiseid:',
      items: [
        'Vajalikud küpsised — salvestavad sinu kalkulaatori edenemise, eelistused (nt tume/hele režiim) ja küpsisevaliku. Need töötavad alati ega vaja nõusolekut.',
        'Analüütika küpsised — Google Analytics kasutab neid külastuste mõõtmiseks. Neid seatakse alles siis, kui annad selleks nõusoleku.',
      ],
    },
    {
      heading: 'Nõusolek ja selle muutmine',
      body: 'Kuni sa pole nõusolekut andnud, töötab Google Analytics küpsisteta režiimis ega salvesta sinu seadmesse midagi. Kui vajutad „Nõustun\", lubad analüütika küpsised. Oma valikut saad igal ajal muuta, kustutades brauseris selle lehe küpsised — seejärel küsime nõusolekut uuesti.',
    },
    {
      heading: 'Kolmandad osapooled',
      body: 'Anonüümse statistika kogumiseks kasutame kahte teenust:',
      items: [
        'Google Analytics (Google Ireland Ltd.) — veebiliikluse analüüs. IP-aadressid anonümiseeritakse.',
        'Plausible Analytics — privaatsussõbralik, küpsisevaba analüütika, mis ei jälgi üksikkasutajaid.',
      ],
    },
    {
      heading: 'Sinu õigused',
      body: 'Kuna me ei salvesta sinu isikuandmeid, ei ole meil sinuga seotud profiili. Sul on siiski õigus keelduda analüütikast (vali „Ainult vajalikud\") ja kustutada kõik küpsised oma brauseri seadetest. Küsimuste korral võta meiega ühendust.',
    },
    {
      heading: 'Kontakt',
      body: 'Privaatsusküsimustes kirjuta meile: info@unevalem.ee',
    },
  ],
}

export const footer = {
  tagline: 'Unevalem — Eesti parim unenõuannete ressurss.',
  copyright: (year: number) => `© ${year} Unevalem`,
  links: {
    privacy: 'Privaatsuspoliitika',
    contact: 'Kontakt',
    about: 'Meist',
    terms: 'Müügitingimused',
  },
  // Legal identity line (registrikood from e-Äriregister, 2026-07-17).
  // Costlio OÜ is NOT VAT-registered: never render "sisaldab käibemaksu",
  // "km-ga" or any VAT wording anywhere on the site — prices are final as-is.
  // info@unevalem.ee: domain has MX (Elkdata) — make sure the mailbox/forward
  // actually exists before the first sale.
  legal: 'Unevalem — Costlio OÜ · registrikood 14562345 · e-post info@unevalem.ee',
}

export const aboutPage = {
  metaTitle: 'Meist | Unevalem',
  metaDescription: 'Kes teeb Unevalemit, miks see olemas on ja kuidas see end rahastab.',
  heading: 'Meist',
  sections: [
    {
      id: 'kes',
      heading: 'Kes me oleme',
      body: 'Unevalem on Eesti unehariduse leht, mida teeb väike Eesti ettevõte Costlio OÜ. Meid ajendas lihtne tähelepanek: eestikeelset, teaduspõhist ja ausalt kirjutatud uneinfot on veebis üllatavalt vähe — küll aga leidub palju müügijuttu, mis esitleb end nõuandena. Tahtsime teha lehe, mida ise oleksime uneprobleemide korral lugeda tahtnud.',
    },
    {
      id: 'miks',
      heading: 'Miks Unevalem on olemas',
      body: 'Meie põhimõte on lihtne: kõigepealt harime, alles siis müüme. Iga artikkel toetub avaldatud uneuuringutele ja iga artikli lõpus on viide algallikale, et saaksid ise järele kontrollida. Kui õpid siit midagi kasulikku ja ostad padja hoopis mujalt — ka see on meie jaoks hea tulemus. Usaldus on ainus asi, mida unenõuannete leht päriselt omab.',
    },
    {
      id: 'rahastus',
      heading: 'Kuidas Unevalem end rahastab',
      body: 'Unevalem müüb osa soovitatud toodetest ise — see on meie ainus tuluallikas. Reklaame me ei näita ja andmeid me ei müü.\n\nEt see ei muudaks meie soovitusi kallutatuks, kehtivad kolm reeglit. Esiteks: kalkulaatori ja artiklite soovitused sünnivad sinu vastuste ja uneuuringute, mitte müügihuvi põhjal. Teiseks: iga soovituse juures on selgelt märgitud, kas tegu on meie enda tootega („Unevalemi toode") või välise poe omaga („Väline pood"). Kolmandaks: kui sinu vastustest selgub, et sul pole midagi vaja osta, ütleb kalkulaator sedagi — otse ja ilma „aga äkki siiski" müüginurgata.',
    },
  ],
}

export const termsPage = {
  metaTitle: 'Müügitingimused | Unevalem',
  metaDescription: 'Unevalemi e-poe müügitingimused: tellimine, maksmine, tarne, taganemisõigus ja pretensioonid.',
  heading: 'Müügitingimused',
  // Standard VÕS-based e-shop terms. Not lawyer-reviewed — worth a once-over
  // by a professional before serious volume. No VAT wording (not registered).
  sections: [
    {
      heading: '1. Üldsätted',
      body: 'Veebipoe unevalem.ee (edaspidi: e-pood) omanik ja müüja on Costlio OÜ (registrikood 14562345, e-post info@unevalem.ee). Tingimused kehtivad kõigi e-poest ostetud kaupade kohta ning tellimuse vormistamisega kinnitab ostja, et on tingimustega tutvunud ja nendega nõus.',
    },
    {
      heading: '2. Hinnad',
      body: 'Kõik hinnad on eurodes ja lõplikud. Tarne pakiautomaati sisaldub hinnas, kui tellimuse vormistamisel ei ole märgitud teisiti. Müüjal on õigus hindu muuta; tellimusele kehtib hind, mis kehtis tellimuse vormistamise hetkel.',
    },
    {
      heading: '3. Tellimine ja maksmine',
      body: 'Tellimus vormistatakse e-poe ostukorvi kaudu. Maksmine toimub turvaliselt Maksekeskus AS-i vahendusel (pangalingid ja pangakaardid). Leping loetakse sõlmituks, kui tellimuse summa on laekunud müüja arvelduskontole. Kui tellitud kaupa ei ole võimalik tarnida, teavitab müüja ostjat esimesel võimalusel ja tagastab makse hiljemalt 14 päeva jooksul.',
    },
    {
      heading: '4. Tarne',
      body: 'Kaubad saadetakse ostja valitud pakiautomaati 2–5 tööpäeva jooksul pärast makse kinnitust. Pakiautomaadi saabumiskoodi saad SMS-iga. Kui tellimus hilineb, anname sellest e-posti teel teada.',
    },
    {
      heading: '5. Taganemisõigus',
      body: 'Ostjal on õigus e-poest ostetud kaubast taganeda 14 päeva jooksul alates kauba kättesaamisest, saates avalduse aadressile info@unevalem.ee. Tagastatav kaup peab olema kasutamata, rikkumata ja originaalpakendis. Hügieenilistel põhjustel ei kuulu tagastamisele avatud pakendiga padjad, tekid ja voodipesu (VÕS § 53 lg 4). Tagastamise otsesed kulud kannab ostja. Makse tagastame hiljemalt 14 päeva jooksul pärast kauba tagasijõudmist.',
    },
    {
      heading: '6. Pretensioonid',
      body: 'Ostjal on õigus esitada kauba puuduse korral pretensioon kahe aasta jooksul alates kauba kättesaamisest (VÕS § 218). Pretensioon tuleb saata aadressile info@unevalem.ee koos tellimuse numbri ja puuduse kirjeldusega. Puudusega kauba parandame, asendame või tagastame makse.',
    },
    {
      heading: '7. Vaidluste lahendamine',
      body: 'Küsimused ja mured lahendame eelkõige läbirääkimiste teel — kirjuta info@unevalem.ee. Kui kokkulepet ei sünni, on ostjal õigus pöörduda Tarbijakaitse ja Tehnilise Järelevalve Ameti tarbijavaidluste komisjoni (ttja.ee) või Euroopa Liidu ODR-platvormi (ec.europa.eu/odr) poole.',
    },
    {
      heading: '8. Isikuandmed',
      body: 'Tellimuse täitmiseks kasutame ostja nime, e-posti, telefoninumbrit ja valitud pakiautomaati. Andmete töötlemisest loe lähemalt privaatsuspoliitikast.',
    },
  ],
}
