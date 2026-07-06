'use client'

import { useSettings } from '../hooks/useSettings'
import SettingsForm from './SettingsForm'
import { Loader2 } from 'lucide-react'

export default function SettingsContainer() {
  const settingsProps = useSettings()

  if (settingsProps.isAuthLoading || !settingsProps.user) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return <SettingsForm {...settingsProps} />
}
