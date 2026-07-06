import { useRef, useState, useEffect } from 'react'

export function useChartDimensions() {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 })

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return
      const { width, height } = entries[0].contentRect
      setDimensions({ 
        width: Math.floor(width), 
        height: Math.floor(height) || 300 
      })
    })

    observer.observe(element)
    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [])

  return [ref, dimensions] as const
}
