import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { CalcConfig } from '~/types'

export default defineEventHandler((): CalcConfig[] => {
  const path = join(process.cwd(), 'public/data/calculators.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CalcConfig[]
  } catch {
    return []
  }
})
