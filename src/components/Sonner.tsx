import * as React from 'react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

export const Toaster = ({ ...props }: ToasterProps) => (
  <SonnerToaster
    theme="system"
    className="toaster group"
    style={
      {
        '--normal-bg': 'var(--color-card)',
        '--normal-text': 'var(--color-card-fg)',
        '--normal-border': 'var(--color-border)',
      } as React.CSSProperties
    }
    {...props}
  />
)

export { toast } from 'sonner'
