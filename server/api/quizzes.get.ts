import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Quiz } from '~/types'

export default defineEventHandler((): Quiz[] => {
  const path = join(process.cwd(), 'public/data/quizzes.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Quiz[]
  } catch {
    return []
  }
})
