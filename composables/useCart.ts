import type { CartItem, Product } from '~/types'

// Cart state, persisted in localStorage. Only ids + quantities are stored —
// prices always come from the current products.json (and are re-verified
// server-side by the Apps Script when the order is created).
export function useCart() {
  const items = useStorage<CartItem[]>('uva-cart', [])
  const isOpen = useState('cart-open', () => false)

  const { products } = useProducts()

  // Cart rows joined with live product data; rows whose product vanished from
  // the sheet are dropped from display (and from any order payload).
  const lines = computed(() => {
    const all = products.value ?? []
    return items.value
      .map((item) => {
        const product = all.find(p => p.id === item.id)
        return product ? { ...item, product } : null
      })
      .filter((l): l is CartItem & { product: Product } => l !== null)
  })

  const count = computed(() => lines.value.reduce((sum, l) => sum + l.qty, 0))
  const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.qty * l.product.price, 0))
  const subtotalText = computed(() => `${subtotal.value.toFixed(2).replace('.', ',')} €`)

  function add(id: string, qty = 1) {
    const existing = items.value.find(i => i.id === id)
    if (existing) existing.qty += qty
    else items.value.push({ id, qty })
    isOpen.value = true
    gaEvent('add_to_cart', { product_id: id })
  }

  function setQty(id: string, qty: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    if (qty <= 0) remove(id)
    else item.qty = qty
  }

  function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return {
    items, lines, count, subtotal, subtotalText, isOpen,
    add, setQty, remove, clear,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
