import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Tip } from '~/types'

export default defineEventHandler((): Tip[] => {
  const path = join(process.cwd(), 'public/data/tips.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Tip[]
  } catch {
    return []
  }
})
