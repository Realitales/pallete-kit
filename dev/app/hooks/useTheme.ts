import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'light'
    return (document.documentElement.dataset.theme as Theme) || 'light'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return [theme, setTheme]
}
