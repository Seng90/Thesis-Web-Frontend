'use client'

import { useParams } from 'next/navigation'
import EditCompanyContainer from '@/features/companies/components/EditCompanyContainer'

export default function EditCompanyPage() {
  const params = useParams()
  const companyId = params.id as string
  return <EditCompanyContainer companyId={companyId} />
}
