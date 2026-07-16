import type { Product } from '~/types'

// A recommendation links to an external shop when its storeUrl leaves
// unevalem.ee. Placeholder ('#'), empty, and relative URLs are own products —
// no separate sheet column needed.
export function isExternalStore(url?: string): boolean {
  if (!url || url === '#') return false
  try {
    const host = new URL(url).hostname
    return host !== 'unevalem.ee' && !host.endsWith('.unevalem.ee')
  } catch {
    return false
  }
}

export function storeBadge(product: Pick<Product, 'storeUrl'>): 'own' | 'external' {
  return isExternalStore(product.storeUrl) ? 'external' : 'own'
}
