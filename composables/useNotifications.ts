import type { Notification } from '~/types'

export function useNotifications() {
  const { data } = useFetch<Notification[]>('/api/notifications', {
    default: () => [] as Notification[],
  })

  const queue = ref<Notification[]>([])
  const current = ref<Notification | null>(null)
  const visible = ref(false)

  function shuffled(arr: Notification[]): Notification[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  function showNext(): boolean {
    const active = (data.value ?? []).filter(n => n.active)
    if (!active.length) return false
    if (!queue.value.length) queue.value = shuffled(active)
    current.value = queue.value.shift()!
    visible.value = true
    return true
  }

  function hide() {
    visible.value = false
  }

  return { current, visible, showNext, hide }
}
