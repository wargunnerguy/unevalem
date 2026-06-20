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

export interface UserProfile {
  position:      SleepPosition
  bodyType:      BodyType
  neckPain:      NeckPain
  sweating:      SweatingLevel
  temp:          TempPreference
  blanketWeight: BlanketWeight
  partner:       PartnerSituation
  allergies:     AllergyProfile
  pillowAge:     PillowAge
  complaint:     MainComplaint
  backPain?:     BackPain
  mattressAge?:  MattressAge
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
  id:        number
  text:      string
  type:      'purchase' | 'view' | 'quiz'
  timestamp: string  // ISO 8601, e.g. "2025-06-20T10:30:00"
  active:    boolean
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
