import NextImage from 'next/image'
import { stegaClean } from '@sanity/client/stega'
import { getImageDimensions } from '@sanity/asset-utils'
import { urlForImage } from '@/sanity/lib/utils'

interface CoverImageProps {
  image: any
  priority?: boolean
}

const normalizeImageSource = (source?: any) => {
  if (!source?.asset) return null
  if (source.asset._ref) return source
  if (source.asset._id) {
    return {
      ...source,
      asset: { _ref: source.asset._id },
    }
  }
  return null
}

export default function CoverImage({
  image: source,
  priority,
}: CoverImageProps) {
  const normalized = normalizeImageSource(source)
  const fallbackUrl = source?.asset?.url
  const imageUrl = (normalized && urlForImage(normalized)?.url()) || fallbackUrl

  if (!imageUrl) return null

  const { width, height } = normalized
    ? getImageDimensions(normalized)
    : { width: 1600, height: 900 }

  return (
    <div className='relative w-full h-auto'>
      <NextImage
        src={imageUrl}
        alt={stegaClean(source?.alt) || ''}
        width={width}
        height={height}
        className='w-full h-auto object-cover'
        priority={priority}
        sizes='(min-width: 1024px) 25vw, 45vw'
      />
    </div>
  )
}
