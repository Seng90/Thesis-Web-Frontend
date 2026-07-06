import { API_BASE } from '@/lib/apiClient'
import type { Package } from '@/lib/types'

export async function fetchPackages(): Promise<Package[]> {
  const res = await fetch(`${API_BASE}/user/packages`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch packages')
  const text = await res.text()
  if (!text) return []
  const data = JSON.parse(text)
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    features: p.features,
    purchaseCount: p.purchaseCount ?? p.purchase_count ?? 0,
    createdAt: p.createdAt ?? p.created_at,
    updatedAt: p.updatedAt ?? p.updated_at,
  }))
}
