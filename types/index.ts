export type SleepPosition = 'side' | 'back' | 'stomach' | 'combo'
export type TempPreference = 'cold' | 'normal' | 'hot'
export type PillowLoft = 'low' | 'medium' | 'high'
export type PartnerSituation = 'solo' | 'shared' | 'separate'
export type SleepIssue = 'hot' | 'neck' | 'insomnia' | 'light'

export interface UserProfile {
  position: SleepPosition
  temp: TempPreference
  loft: PillowLoft
  partner: PartnerSituation
  issues: SleepIssue[]
}

export interface ProductRec {
  id: string
  name: string
  reason: string
  urgency: 'must-have' | 'nice-to-have'
  category: 'pillow' | 'blanket' | 'topper' | 'extra'
  linkUrl?: string
}

export interface CalculatorResult {
  currentScore: number
  improvedScore: number
  recommendations: ProductRec[]
  personalTips: string[]
}

export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: 'teadus' | 'nõuanded' | 'tooted' | 'uneaeg'
  publishDate: string
  tags: string[]
  coverImage: string
  status: 'published' | 'draft'
  isFeatured: boolean
  readingTimeMin: number
}

export interface Notification {
  id: number
  text: string
  type: 'purchase' | 'view' | 'quiz'
  hoursAgo: number
  active: boolean
}

export interface Stat {
  key: string
  value: string
  displayText: string
  active: boolean
}
