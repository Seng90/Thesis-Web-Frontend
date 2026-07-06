'use client'

import { use } from 'react'
import EditCompanyContainer from '@/features/companies/components/EditCompanyContainer'

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = use(params)
  return <EditCompanyContainer companyId={companyId} />
}
