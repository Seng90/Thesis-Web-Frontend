'use client'

import { useEffect } from 'react'

export default function ViewCounter({ companyId }: { companyId: string }) {
  useEffect(() => {
    // Call the increment endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    fetch(`${apiUrl}/user/companies/${companyId}/view`, { method: 'POST' })
      .catch((err) => console.error('Failed to update view count', err))
  }, [companyId])

  return null
}
