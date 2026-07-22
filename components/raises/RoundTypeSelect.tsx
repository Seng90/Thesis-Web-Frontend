'use client'

import { useState, useEffect } from 'react'
import { Edit2, X, Plus } from 'lucide-react'

const DEFAULT_OPTIONS = [
  'Pre-seed',
  'Seed',
  'Pre-Series A',
  'Series A',
  'Series B',
  'Debt Financing'
]

interface RoundTypeSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function RoundTypeSelect({ value, onChange }: RoundTypeSelectProps) {
  const [customOptions, setCustomOptions] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newOption, setNewOption] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('investrack_custom_round_types')
    if (saved) {
      try {
        setCustomOptions(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const saveCustomOptions = (opts: string[]) => {
    setCustomOptions(opts)
    localStorage.setItem('investrack_custom_round_types', JSON.stringify(opts))
  }

  const handleAdd = () => {
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (DEFAULT_OPTIONS.includes(trimmed) || customOptions.includes(trimmed)) {
      setNewOption('')
      return
    }
    saveCustomOptions([...customOptions, trimmed])
    setNewOption('')
  }

  const handleRemove = (opt: string) => {
    saveCustomOptions(customOptions.filter(o => o !== opt))
    if (value === opt) {
      onChange(DEFAULT_OPTIONS[0])
    }
  }

  const allOptions = [...DEFAULT_OPTIONS, ...customOptions]

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          name="roundType"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-3 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {allOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center justify-center w-12 h-[46px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:border-indigo-500 transition-colors"
          title="Edit options"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Round Types</h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New round type..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                className="block flex-1 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 px-3 text-sm text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newOption.trim()}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">Default Options (Cannot remove)</p>
              {DEFAULT_OPTIONS.map(opt => (
                <div key={opt} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                </div>
              ))}
              
              {customOptions.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 mt-4 mb-2">Custom Options</p>
                  {customOptions.map(opt => (
                    <div key={opt} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                      <span className="text-sm text-slate-900 dark:text-white font-medium">{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(opt)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-slate-800 dark:bg-slate-700 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-900 dark:hover:bg-slate-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
