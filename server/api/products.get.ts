import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Product } from '~/types'

export default defineEventHandler((): Product[] => {
  const path = join(process.cwd(), 'public/data/products.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Product[]
  } catch {
    return []
  }
})
