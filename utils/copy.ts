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

  variantLabels: {
    pillow:  'Leia oma ideaalne padi — alusta siit',
    blanket: 'Leia oma ideaalne tekk — alusta siit',
    sleep:   'Ehita oma täielik une profiil — 3 testi',
  } as Record<string, string>,
  progressLabel: (step: number, total: number) => `Samm ${step} / ${total}`,
  timeLeft: (step: number): string => {
    const sek = (6 - step) * 20
    if (sek >= 60) return `~${Math.ceil(sek / 60)} min`
    if (sek > 0) return `~${sek} sek`
    return ''
  },

  configs: {
    pillow: {
      icon: '🛏️',
      title: 'Padi',
      description: 'Leia täpselt sulle sobiv padi',
      stepKeys: ['position', 'bodyType', 'neckPain', 'allergies', 'pillowAge'] as const,
      steps: [
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
          question: 'Kas ärkad hommikul kaela- või õlavaluga?',
          options: [
            { label: 'Jah, sageli', value: 'often' },
            { label: 'Mõnikord', value: 'sometimes' },
            { label: 'Ei', value: 'never' },
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
      stepKeys: ['sweating', 'temp', 'blanketWeight', 'partner', 'allergies'] as const,
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
          question: 'Kas sul esineb allergia või tundlikkus?',
          options: [
            { label: 'Tolmulestade suhtes', value: 'dust-mites' },
            { label: 'Sünteetiliste materjalide suhtes', value: 'synthetic' },
            { label: 'Muu allergia või tundlikkus', value: 'other' },
            { label: 'Pole teadaolevaid allergiaid', value: 'none' },
          ],
        },
      ],
    },
    mattress: {
      icon: '💤',
      title: 'Madrats',
      description: 'Leia täpselt sulle sobiv madrats',
      stepKeys: ['position', 'bodyType', 'backPain', 'partner', 'mattressAge'] as const,
      steps: [
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
    ctaButton: 'Vaata kõiki tooteid →',
    mustHaveBadge: 'Oluline',
    niceToHaveBadge: 'Kasulik',
    noUrgentNeedMessage: 'Sul pole praegu kiireloomulist vajadust — aga saad alati edasi täiustada.',
  },
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

  // Stats strip: show these 3 keys in this order, with Estonian labels.
  // Values come from Sheets; labels are defined here (override Sheets displayText).
  featuredStatKeys: ['calculatorCompletions', 'monthlyVisitors', 'totalViews'] as const,
  statLabels: {
    calculatorCompletions: 'inimest leidnud oma unevalemi',
    monthlyVisitors:       'külastajat kuus',
    totalViews:            'lugemist kokku',
  } as Record<string, string>,
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

export const footer = {
  tagline: 'Unevalem — Eesti parim unenõuannete ressurss.',
  copyright: (year: number) => `© ${year} Unevalem`,
  links: {
    privacy: 'Privaatsuspoliitika',
    contact: 'Kontakt',
  },
}
