'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  defaultValue?: string
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  defaultValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 transition-all duration-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300"
      />
    </div>
  )
}
