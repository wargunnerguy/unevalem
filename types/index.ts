export type SleepPosition    = 'side' | 'back' | 'stomach' | 'combo'
export type TempPreference   = 'cold' | 'normal' | 'hot'
export type PartnerSituation = 'solo' | 'shared' | 'separate'
export type BodyType         = 'slim' | 'medium' | 'broad'
export type NeckPain         = 'often' | 'sometimes' | 'never'
export type SweatingLevel    = 'often' | 'sometimes' | 'rarely'
export type BlanketWeight    = 'light' | 'medium' | 'heavy'
export type AllergyProfile   = 'dust-mites' | 'synthetic' | 'other' | 'none'
export type PillowAge        = 'new' | '1-3y' | '3y+'
export type MainComplaint    = 'cant-sleep' | 'wake-at-night' | 'wake-tired' | 'none'
export type BackPain         = 'often' | 'sometimes' | 'never'
export type MattressAge      = 'new' | '1-3y' | '3-5y' | '5y+'
export type CalcType         = 'pillow' | 'blanket' | 'mattress'
export type AgeGroup         = 'young' | 'adult' | 'middle' | 'senior'
export type SleepQuality     = 'poor' | 'fair' | 'good'
export type PillowCount      = 'one' | 'two-plus'
export type CurrentMattress  = 'spring' | 'foam' | 'hybrid' | 'unknown'
export type RoomTemp         = 'cool' | 'moderate' | 'warm'
export type ProblemSeason    = 'winter' | 'summer' | 'year-round'

export interface UserProfile {
  position:        SleepPosition
  bodyType:        BodyType
  neckPain:        NeckPain
  sweating:        SweatingLevel
  temp:            TempPreference
  blanketWeight:   BlanketWeight
  partner:         PartnerSituation
  allergies:       AllergyProfile
  pillowAge:       PillowAge
  complaint:       MainComplaint
  backPain?:       BackPain
  mattressAge?:    MattressAge
  age?:            AgeGroup
  sleepQuality?:   SleepQuality
  pillowCount?:    PillowCount
  currentMattress?: CurrentMattress
  roomTemp?:       RoomTemp
  problemSeason?:  ProblemSeason
}

export interface CalcCompletion {
  answers:     Record<string, string>
  productName: string
  completedAt: string
}

export interface SiteProfile {
  pillow?:   CalcCompletion
  blanket?:  CalcCompletion
  mattress?: CalcCompletion
}

export interface Product {
  id:          string
  name:        string
  category:    'pillow' | 'blanket' | 'mattress' | 'pillowcase' | 'duvetcover' | 'sheet'
  subcategory: string
  description: string
  price:       number
  priceText:   string
  imageUrl?:   string
  storeUrl:    string
  tags:        string[]
  active:      boolean
  isFeatured:  boolean
}

export interface ProductRec {
  id:         string
  name:       string
  reason:     string
  urgency:    'must-have' | 'nice-to-have'
  category:   'pillow' | 'blanket' | 'mattress' | 'topper' | 'extra'
  linkUrl?:   string
  priceText?: string
  imageUrl?:  string
}

export interface CalculatorResult {
  currentScore:    number
  improvedScore:   number
  recommendations: ProductRec[]
  personalTips:    string[]
  noUrgentNeed:    boolean
}

export interface Post {
  id:             number
  slug:           string
  title:          string
  excerpt:        string
  content:        string
  category:       'teadus' | 'nõuanded' | 'tooted' | 'uneaeg'
  publishDate:    string
  tags:           string[]
  coverImage:     string
  status:         'published' | 'draft'
  isFeatured:     boolean
  isMyth:         boolean
  readingTimeMin: number
  diveDeeper:     { title: string; url: string }[]
}

export interface Notification {
  id:     number
  text:   string
  type:   'purchase' | 'view' | 'quiz'
  active: boolean
  // No time field: the toast renders a fresh random "X ago" each show so social
  // proof always feels live (see SocialProofToast.vue). Don't add one back.
}

export interface Stat {
  key:         string
  value:       string
  displayText: string
  active:      boolean
}

export interface Tip {
  id:     number
  text:   string
  active: boolean
}

export interface QuizOption {
  label: string
  value: number
}

export interface QuizQuestion {
  question: string
  options:  QuizOption[]
}

export interface QuizResult {
  key:         string
  minScore:    number
  maxScore:    number
  type:        string
  description: string
  tips:        string[]
}

// Fully assembled at build time from the quizzes / quiz_questions / quiz_results
// Sheets tabs, so the frontend receives ready-to-render nested objects.
export interface Quiz {
  id:           string
  title:        string
  description:  string
  tipsHeading:  string
  sharePrefix:  string
  questions:    QuizQuestion[]
  results:      QuizResult[]
}
