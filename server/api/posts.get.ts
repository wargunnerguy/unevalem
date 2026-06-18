import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Post } from '~/types'

export default defineEventHandler((): Post[] => {
  const path = join(process.cwd(), 'public/data/posts.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Post[]
  } catch {
    return []
  }
})
