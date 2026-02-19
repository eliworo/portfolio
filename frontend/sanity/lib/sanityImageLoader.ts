import type { ImageLoaderProps } from 'next/image'

const SANITY_HOST = 'cdn.sanity.io'
const DEFAULT_QUALITY = 72
const MAX_WIDTH = 2400

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src || src.startsWith('/')) return src
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

  const safeWidth = Math.max(1, Math.min(width, MAX_WIDTH))
  parsed.searchParams.set('w', String(safeWidth))
  parsed.searchParams.set('fit', 'max')
  parsed.searchParams.set('auto', 'format')
  parsed.searchParams.set('q', String(quality ?? DEFAULT_QUALITY))

  return parsed.toString()
}
