import type { ImageLoaderProps } from 'next/image'

const SANITY_HOST = 'cdn.sanity.io'
const DEFAULT_QUALITY = 72
const MAX_WIDTH = 2400

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  const safeWidth = Math.max(1, Math.min(width, MAX_WIDTH))
  const safeQuality = quality ?? DEFAULT_QUALITY

  if (!src) return src
  if (src.startsWith('/')) {
    const joiner = src.includes('?') ? '&' : '?'
    return `${src}${joiner}w=${safeWidth}&q=${safeQuality}`
  }
  if (src.startsWith('data:') || src.startsWith('blob:')) return src

  let parsed: URL
  try {
    parsed = new URL(src)
  } catch {
    return src
  }

  if (parsed.hostname !== SANITY_HOST) {
    return src
  }

  parsed.searchParams.set('w', String(safeWidth))
  parsed.searchParams.set('fit', 'max')
  parsed.searchParams.set('auto', 'format')
  parsed.searchParams.set('q', String(safeQuality))

  return parsed.toString()
}
