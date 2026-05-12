import type { ImageLoaderProps } from 'next/image'
import {
  DEFAULT_OPTIMIZED_IMAGE_QUALITY,
  buildOptimizedImageUrl,
} from './optimizedImageUrl'

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  return buildOptimizedImageUrl(
    src,
    width,
    quality ?? DEFAULT_OPTIMIZED_IMAGE_QUALITY,
  )
}
