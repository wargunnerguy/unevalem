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
  heroHeading: 'Mis tüüpi padi sobib sulle kõige paremini?',
  heroSubtext: 'Vasta 10 küsimusele — saad täpse soovituse padi, teki ja muu kohta.',

  variantHeadings: {
    pillow:  'Mis tüüpi padi sobib sulle kõige paremini?',
    blanket: 'Mis tüüpi tekk sobib sulle kõige paremini?',
    sleep:   'Kui hea on sinu une kvaliteet?',
  } as Record<string, string>,
  variantSubtexts: {
    pillow:  'Vasta 10 küsimusele — saad täpse soovituse, milline padi, tekk ja muud voodimaterjalid sulle sobivad.',
    blanket: 'Vasta 10 küsimusele — leia täpselt sobiv tekk, padi ja muud voodimaterjalid.',
    sleep:   'Vasta 10 küsimusele — saa teada oma uneskoor ja personaalsed soovitused une parandamiseks.',
  } as Record<string, string>,
  progressLabel: (step: number, total: number) => `Samm ${step} / ${total}`,
  timeLeft: (step: number): string => {
    const sek = (11 - step) * 12
    if (sek >= 60) return `~${Math.ceil(sek / 60)} min`
    if (sek > 0) return `~${sek} sek`
    return ''
  },

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
        { label: 'Kerget — soovin tunda ainult puudutust', value: 'light' },
        { label: 'Keskmist — normaalne soojus', value: 'medium' },
        { label: 'Rasket ja soojendavamat', value: 'heavy' },
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
    {
      question: 'Kui vana on sinu praegune padi?',
      options: [
        { label: 'Uus (alla 1 aasta)', value: 'new' },
        { label: '1–3 aastat vana', value: '1-3y' },
        { label: 'Üle 3 aasta vana', value: '3y+' },
      ],
    },
    {
      question: 'Mis on sinu peamine uneprobleem?',
      options: [
        { label: 'Raske uinuda', value: 'cant-sleep' },
        { label: 'Ärkan öösel üles', value: 'wake-at-night' },
        { label: 'Ärkan väsinuna', value: 'wake-tired' },
        { label: 'Pole probleeme', value: 'none' },
      ],
      submitLabel: 'Analüüsi minu und →',
    },
  ],

  result: {
    currentScoreLabel: 'Sinu praegune uneskoor',
    improvedScoreLabel: 'Pärast muutusi',
    scoreUnit: '/ 100',
    pillowHeading: 'Sinu ideaalne padi',
    blanketHeading: 'Sinu sobiv tekk',
    tipsHeading: 'Isiklikud unenõuanded',
    exploreHeading: 'Täienda oma unekeskkonda',
    exploreItems: [
      { label: 'Leia sobiv madrats', hint: 'Tulemas peagi', href: '/pood', disabled: true },
      { label: 'Uuri voodipesu', hint: 'Bambuspadjapüürid ja tekikotid', href: '/pood', disabled: false },
    ],
    ctaButton: 'Vaata kõiki tooteid →',
    mustHaveBadge: 'Oluline',
    niceToHaveBadge: 'Kasulik',
    resetButton: 'Alusta uuesti',
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

// 30 daily sleep tips, rotating by day-of-year: dailyTips[dayOfYear % 30]
export const dailyTips: string[] = [
  'Mine magama ja ärka iga päev samal kellaajal — ka nädalavahetusel. See tugevdab keha sisekella.',
  'Hoia magamistoa temperatuur 16–19°C vahel — jahedam keskkond soodustab sügavamat und.',
  'Väldi kofeiini pärast kella 14. Kofeiin püsib kehas kuni 8 tundi.',
  'Loobu ekraanidest vähemalt 30 minutit enne magamaminekut. Sinine valgus pärsib melatoniini.',
  'Tee magamistuba pimedaks. Isegi väike valgus võib katkestada une sügavad faasid.',
  'Liigu päeva jooksul vähemalt 30 minutit — füüsiline aktiivsus parandab une kvaliteeti.',
  'Väldi rasket söömist 2–3 tundi enne magamaminekut. Söömine aktiveerib seedesüsteemi.',
  'Proovi "4-7-8" hingamist: hinga sisse 4 sekundit, hoia 7, hinga välja 8.',
  'Kirjuta enne magamaminekut üles 3 asja, mille eest oled tänulik. See rahustab meelt.',
  'Kui ärkan öösel, ei tasu vaadata kellaaega — see tekitab ärevust.',
  'Bambusest valmistatud voodipesu reguleerib kehatemperatuuri paremini kui sünteetika.',
  'Mürataustaks sobib valge müra või loodushääled — need blokeerivad ärritavaid helisid.',
  'Päevane uinak kuni 20 minutit annab energiat ilma õhtust und rikkumata.',
  'Alkohol aitab küll uinuda, kuid katkestab REM-une ja halvendab une kvaliteeti üldiselt.',
  'Hommikune päikesevalgus esimese tunni jooksul pärast ärkamist aitab sisekellas ümber häälestuda.',
  'Padi peaks toetama kaela nii, et lülisamba kaelaosa jääb sirgjoonesse — vaata oma asendit.',
  'Mediteerimine vaid 10 minutit enne und vähendab ärkveloleku aega voodis kuni 20%.',
  'Raamat paberil (mitte ekraanil) enne magamaminekut aitab ajul "välja lülituda".',
  'Regulaarne magamaminekurituaal — ükskõik mis — annab ajule märgu, et uni on lähedal.',
  'Magneesium aitab lihaste lõdvestumisel. Toitudes leidub seda rohelistes köögiviljades ja pähklites.',
  'Arvuta oma unetsüklid: keskmiselt 90 minutit tükk — planeeri ärkamine tsükli lõppu.',
  'Teki kaal mõjutab und — liiga kerge ei soojenda, liiga raske pigistab. Leia oma "kuldlukk".',
  'Treeningu lõpetamise ja magamamineku vahel peaks olema vähemalt 2 tundi.',
  'Lavendli lõhn lühendab uinumisaega — proovi lavendliõli difuusorit magamistoas.',
  'Ühiskasutuslik tekk häirib sageli und — eraldi tekid vähendavad öiseid häireid kuni 30%.',
  'Lugege sildi alt: hea padi on elueaga 1,5–2 aastat, mitte 10 aastat.',
  'L-teaniin (rohelist teed leiduv aminohape) aitab lõdvestuda ilma unisust põhjustamata.',
  'Väldi vaidlusi ja stressirikkaid vestlusi tunni jooksul enne magamaminekut.',
  'Tuuluta magamistuba igal õhtul vähemalt 10 minutit — värske õhk parandab une kvaliteeti.',
  'Uuringud näitavad, et regulaarne uneaeg aitab isegi rohkem kui une kestus.',
]
