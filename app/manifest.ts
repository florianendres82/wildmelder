import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wildunfall-Helfer — Wildunfall-Notruf-Assistent',
    short_name: 'Wildunfall-Helfer',
    description: 'Schnelle Hilfe bei Wildunfällen — Jäger sofort finden',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3faff',
    theme_color: '#154212',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
