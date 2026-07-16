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
  // Legal identity line. {REGIKOOD}/{EMAIL} are placeholders the user fills in.
  // Costlio OÜ is NOT VAT-registered: never render "sisaldab käibemaksu",
  // "km-ga" or any VAT wording anywhere on the site — prices are final as-is.
  legal: 'Unevalem — Costlio OÜ · registrikood {REGIKOOD} · e-post {EMAIL}',
}

export const aboutPage = {
  metaTitle: 'Meist | Unevalem',
  metaDescription: 'Kes teeb Unevalemit, miks see olemas on ja kuidas see end rahastab.',
  heading: 'Meist',
  // PLACEHOLDER STRUCTURE — the user writes the final copy. Keep headings.
  sections: [
    {
      id: 'kes',
      heading: 'Kes me oleme',
      body: 'Unevalem on Eesti unehariduse leht, mida teeb Costlio OÜ. [Kasutaja kirjutab siia lõpliku teksti: kes lehte teeb ja miks just uni.]',
    },
    {
      id: 'miks',
      heading: 'Miks Unevalem on olemas',
      body: 'Meie põhimõte on lihtne: kõigepealt harime, alles siis müüme. Kui õpid siit midagi kasulikku ja ostad padja hoopis mujalt — ka see on hea tulemus. [Kasutaja täiendab.]',
    },
    {
      id: 'rahastus',
      heading: 'Kuidas Unevalem end rahastab',
      body: 'Unevalem müüb osa soovitatud toodetest ise — see on meie ainus tuluallikas. Kalkulaatori ja artiklite soovitused sünnivad sinu vastuste ja uneuuringute, mitte müügihuvi põhjal: iga soovituse juures on märgitud, kas tegu on meie enda või välise poe tootega, ja kui sul pole midagi vaja, ütleb kalkulaator sedagi. [Kasutaja täiendab: marginaalid, väliste linkide põhimõte.]',
    },
  ],
}

export const termsPage = {
  metaTitle: 'Müügitingimused | Unevalem',
  metaDescription: 'Unevalemi e-poe müügitingimused.',
  heading: 'Müügitingimused',
  placeholder: 'Müügitingimused on koostamisel ja avaldatakse enne esimese tellimuse vastuvõtmist. Küsimuste korral kirjuta {EMAIL}.',
}
