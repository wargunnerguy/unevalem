import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Stat } from '~/types'

export default defineEventHandler((): Stat[] => {
  const path = join(process.cwd(), 'public/data/stats.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Stat[]
  } catch {
    return []
  }
})
