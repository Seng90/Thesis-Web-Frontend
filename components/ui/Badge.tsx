import { getIndustryColor, getStatusColor, getInvestorTypeColor } from '@/lib/utils'

interface BadgeProps {
  variant: 'industry' | 'status' | 'type'
  value: string
  className?: string
  children?: React.ReactNode
}

const colorFns = {
  industry: getIndustryColor,
  status: getStatusColor,
  type: getInvestorTypeColor,
}

export default function Badge({ variant, value, className = '', children }: BadgeProps) {
  const colorClasses = colorFns[variant](value)

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${colorClasses} ${className}`}
    >
      {children ?? value}
    </span>
  )
}
