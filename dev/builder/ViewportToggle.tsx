import type { Viewport } from './store'

export function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport
  onChange: (v: Viewport) => void
}) {
  return (
    <div className="bg-card inline-flex items-center gap-0 rounded-md border border-border p-0.5 text-sm">
      <ToggleButton active={value === 'desktop'} onClick={() => onChange('desktop')}>
        Desktop
      </ToggleButton>
      <ToggleButton active={value === 'phone'} onClick={() => onChange('phone')}>
        Phone
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      data-active={active}
      className="text-muted-fg data-[active=true]:bg-bg data-[active=true]:text-fg relative rounded-[5px] px-3 py-1 font-medium transition-colors hover:text-fg"
    >
      {children}
      {active && (
        <span className="absolute inset-x-2 -bottom-[3px] h-[2px] bg-acid" />
      )}
    </button>
  )
}
