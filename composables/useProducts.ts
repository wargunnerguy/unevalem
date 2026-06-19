import type { Product } from '~/types'

export function useProducts() {
  const { data: products, pending } = useFetch<Product[]>('/api/products', {
    default: () => [],
  })

  function getByCategory(category: Product['category']): Product[] {
    return (products.value ?? []).filter(p => p.active && p.category === category)
  }

  return { products, pending, getByCategory }
}
