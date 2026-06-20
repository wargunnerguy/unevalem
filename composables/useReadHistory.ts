export function useReadHistory() {
  const reads = useCookie<Record<string, number>>('uva-reads', {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: 'lax',
    default: () => ({}),
  })

  const visits = useCookie<number>('uva-visits', {
    maxAge: 60 * 60 * 24 * 90,
    sameSite: 'lax',
    default: () => 0,
  })

  function markRead(slug: string) {
    reads.value = { ...reads.value, [slug]: (reads.value[slug] ?? 0) + 1 }
  }

  function isRead(slug: string): boolean {
    return (reads.value[slug] ?? 0) > 0
  }

  function incrementVisit() {
    if (import.meta.client) {
      visits.value = (visits.value ?? 0) + 1
    }
  }

  // Sort: unread articles first, then least-read, then preserve original order
  function sortUnreadFirst<T extends { slug: string }>(arr: T[]): T[] {
    return [...arr].sort((a, b) => {
      const ra = reads.value[a.slug] ?? 0
      const rb = reads.value[b.slug] ?? 0
      if (ra === rb) return 0
      if (ra === 0) return -1
      if (rb === 0) return 1
      return ra - rb
    })
  }

  return { reads, visits, markRead, isRead, incrementVisit, sortUnreadFirst }
}
