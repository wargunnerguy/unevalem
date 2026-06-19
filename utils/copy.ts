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
  hoursAgo: 'tundi tagasi',
}

export const calculator = {
  version: 'v2.5',
  heroLabel: 'Leia täpselt sulle sobiv voodivara — 2 minutiga',

  variantLabels: {
    pillow:  'Leia oma ideaalne padi — 2 minutiga',
    blanket: 'Leia oma ideaalne tekk — 2 minutiga',
    sleep:   'Uuri, mis rikub sinu und — 2 minutiga',
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
            { label: 'Pole', value: 'none' },
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
            { label: 'Pole', value: 'none' },
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
  statsSection: 'inimest on leidnud oma unevalemi',
  featuredPostsHeading: 'Populaarseimad artiklid',
}

export const quizPage = {
  heading: 'Unetest',
  metaTitle: 'Unetest – mis tüüpi magaja sa oled? | Unevalem',
  metaDescription: 'Testi oma uneteadmisi ja avasta oma unetüüp. Interaktiivsed unetestid parema une nimel.',
  backToQuizzes: 'Tagasi viktoriinide juurde',
  shareResult: 'Minu unetüüp',
  tryCalculator: 'Proovi ka Unevalemit →',
}

export const quizzes = {
  chronotype: {
    title: 'Kas sa oled öökulli või lõoke?',
    description: 'Vasta 8 küsimusele ja avasta oma kronotüüp — see selgitab, miks mõnel on hommikul energia ja teisel õhtul.',
    questions: [
      {
        question: 'Millal ärkad eelistatult nädalavahetusel, kui kellaäratust pole?',
        options: [
          { label: 'Enne kella 7', value: 3 },
          { label: 'Kella 7–9 vahel', value: 2 },
          { label: 'Pärast kella 9', value: 1 },
        ],
      },
      {
        question: 'Millal tunned end oma parimas energias?',
        options: [
          { label: 'Hommikul (7–10)', value: 3 },
          { label: 'Päeval (11–14)', value: 2 },
          { label: 'Õhtul (18–22)', value: 1 },
        ],
      },
      {
        question: 'Kui raske on sul hommikul ärgata?',
        options: [
          { label: 'Üldse mitte raske — ärkan ise', value: 3 },
          { label: 'Natuke raske, aga saan hakkama', value: 2 },
          { label: 'Väga raske, vajan mitu äratust', value: 1 },
        ],
      },
      {
        question: 'Millal lähed tavaliselt magama tööpäeviti?',
        options: [
          { label: 'Enne kella 22', value: 3 },
          { label: 'Kella 22–24 vahel', value: 2 },
          { label: 'Pärast südaööd', value: 1 },
        ],
      },
      {
        question: 'Kui tihti tunned end hommikusöögil täiesti ärkvel?',
        options: [
          { label: 'Alati', value: 3 },
          { label: 'Mõnikord', value: 2 },
          { label: 'Harva või mitte kunagi', value: 1 },
        ],
      },
      {
        question: 'Millal sooviksid teha kõige tähtsamat tööd?',
        options: [
          { label: 'Varahommikul', value: 3 },
          { label: 'Keskpäeval', value: 2 },
          { label: 'Hilisõhtul', value: 1 },
        ],
      },
      {
        question: 'Mis juhtub, kui pead nädalavahetusel enne kella 7 ärkama?',
        options: [
          { label: 'Pole probleem', value: 3 },
          { label: 'Natuke tüütu, aga talutav', value: 2 },
          { label: 'Õudus — olen järgmisel päeval täiesti kurnatud', value: 1 },
        ],
      },
      {
        question: 'Millal tunned end kõige unisemana?',
        options: [
          { label: 'Õhtul pärast kella 21', value: 3 },
          { label: 'Pärast lõunat kella 14–15 paiku', value: 2 },
          { label: 'Hommikul kuni kella 10-ni', value: 1 },
        ],
      },
    ],
    results: {
      lark: {
        range: [20, 24],
        type: 'Lõoke 🐦',
        description: 'Sa oled selge hommikuinimene — lõoke! Ärkad kergelt, oled hommikuti produktiivne ja väsid õhtuti varakult. See on geneetiliselt määratud ja täiesti normaalne. Sinu suurim väljakutse on hilisõhtused sotsiaalsed kohustused, mis lükkavad und hilisemaks.',
        tips: [
          'Kasuta oma hommikust tipphetke tähtsamate ülesannete jaoks.',
          'Õhtustel üritustel jälgi, et magama jõuaksid siiski oma tavalisel ajal.',
        ],
      },
      intermediate: {
        range: [15, 19],
        type: 'Vahelpealne 🌅',
        description: 'Sa oled vahepealne tüüp — ei liiga vara, ei liiga hilja. Enamik inimesi kuulub siia kategooriasse. Sul on paindlikkus kohaneda nii hommiku- kui õhtugraafikutega, kuigi suurim produktiivsus on tavaliselt hommikupoolikul.',
        tips: [
          'Säilita regulaarne unegraafik, et keha sisemine kell püsiks stabiilsena.',
          'Väldi enne magamaminekut ekraane — see aitab kiiremini uinuda.',
        ],
      },
      owl: {
        range: [8, 14],
        type: 'Öökull 🦉',
        description: 'Sa oled öökull — loomuliku kalduvusega hilisele ärkvelolekule ja hilisele magamaminekule. Õhtuti on sul energia tipptasemel. Ühiskonna varane päevagraafik võib sulle olla väljakutse, aga see pole iseloogipuudus — see on bioloogia.',
        tips: [
          'Proovi järk-järgult magamaminekuaega 15 minutit varasemaks nihutada.',
          'Hommikune valgus aitab sisekellas nihkuda — ava kardinad kohe pärast ärkamist.',
        ],
      },
    },
    sharePrefix: 'Minu unetüüp:',
  },
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
