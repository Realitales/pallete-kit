export interface ThemeKit {
  id: string
  name: string
  description: string
  fonts?: string[]
}

export const themes: Record<string, ThemeKit> = {
  atelier: {
    id: 'atelier',
    name: 'Atelier',
    description: 'Warm cream paper, indigo ink, acid-lime accent.',
  },
  ufitra: {
    id: 'ufitra',
    name: 'UFITRA',
    description: 'Editorial Telemetry — dark surfaces, momentum indigo, data-forward.',
    fonts: ['Articulat CF', 'JetBrains Mono'],
  },
}

export const themeIds = Object.keys(themes) as (keyof typeof themes)[]
