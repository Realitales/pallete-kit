import { useSyncExternalStore } from 'react'

function getBrand() {
  return document.documentElement.getAttribute('data-brand') ?? 'atelier'
}

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-brand'],
  })
  return () => observer.disconnect()
}

export function useBrand() {
  const brand = useSyncExternalStore(subscribe, getBrand, () => 'atelier')

  function setBrand(id: string) {
    if (id === 'atelier') {
      document.documentElement.removeAttribute('data-brand')
    } else {
      document.documentElement.setAttribute('data-brand', id)
    }
  }

  return [brand, setBrand] as const
}
