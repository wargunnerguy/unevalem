import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Notification } from '~/types'

export default defineEventHandler((): Notification[] => {
  const path = join(process.cwd(), 'public/data/notifications.json')
  if (!existsSync(path)) return []
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Notification[]
  } catch {
    return []
  }
})
