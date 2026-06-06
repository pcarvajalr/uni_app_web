import type { SyntheticEvent } from 'react'

// Placeholder embebido (SVG data URI) que se muestra cuando no hay mapa
// configurado o la imagen almacenada no se puede cargar. Al ser un data URI
// no depende de ningún archivo en /public.
export const MAP_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">' +
    '<rect width="800" height="450" fill="#f1f5f9"/>' +
    '<g fill="none" stroke="#94a3b8" stroke-width="3">' +
    '<path d="M400 160c-33 0-60 27-60 60 0 45 60 110 60 110s60-65 60-110c0-33-27-60-60-60z"/>' +
    '<circle cx="400" cy="220" r="20"/>' +
    '</g>' +
    '<text x="400" y="385" font-family="sans-serif" font-size="26" fill="#64748b" text-anchor="middle">Sin mapa configurado</text>' +
    '</svg>'
)}`

// Reemplaza la imagen rota por el placeholder, evitando bucles de error.
export const handleMapImageError = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget
  if (img.dataset.fallback === 'true') return
  img.dataset.fallback = 'true'
  img.src = MAP_PLACEHOLDER
}
