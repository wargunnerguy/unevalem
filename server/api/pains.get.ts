import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { PainPage } from '~/types'

export default defineEventHandler((): PainPage[] => {
  const path = join(process.cwd(), 'public/data/pains.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as PainPage[]
  } catch {
    return []
  }
})
