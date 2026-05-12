const SANITY_HOST = 'cdn.sanity.io'

export const DEFAULT_OPTIMIZED_IMAGE_QUALITY = 72
export const MAX_OPTIMIZED_IMAGE_WIDTH = 2400

export function clampOptimizedImageWidth(width: number) {
  return Math.max(1, Math.min(Math.round(width), MAX_OPTIMIZED_IMAGE_WIDTH))
}

export function buildOptimizedImageUrl(
  src: string,
  width: number,
  quality = DEFAULT_OPTIMIZED_IMAGE_QUALITY,
): string {
  if (!src) return src
  if (src.startsWith('/')) {
    const parsed = new URL(src, 'http://local.invalid')
    parsed.searchParams.set('w', String(clampOptimizedImageWidth(width)))
    parsed.searchParams.set('q', String(quality))

    return `${parsed.pathname}${parsed.search}`
  }

  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  let parsed: URL
  try {
    parsed = new URL(src)
  } catch {
    return src
  }

  if (parsed.hostname !== SANITY_HOST) {
    return src
  }

  parsed.searchParams.set('w', String(clampOptimizedImageWidth(width)))
  parsed.searchParams.set('fit', 'max')
  parsed.searchParams.set('auto', 'format')
  parsed.searchParams.set('q', String(quality))

  return parsed.toString()
}
