import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ParcelTerminal } from '~/types'

export default defineEventHandler((): ParcelTerminal[] => {
  const path = join(process.cwd(), 'public/data/terminals.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ParcelTerminal[]
  } catch {
    return []
  }
})
