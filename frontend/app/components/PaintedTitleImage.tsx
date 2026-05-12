'use client'

import Image from 'next/image'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { buildOptimizedImageUrl } from '@/sanity/lib/optimizedImageUrl'

type PaintedTitleImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  wrapperClassName?: string
  placeholderClassName?: string
  style?: CSSProperties
  priority?: boolean
  quality?: number
  sizes?: string
  draggable?: boolean
  placeholderWidth?: number
  placeholderQuality?: number
  loading?: 'eager' | 'lazy'
  onLoad?: () => void
  onError?: () => void
}

export default function PaintedTitleImage({
  src,
  alt,
  width,
  height,
  className = '',
  wrapperClassName = '',
  placeholderClassName = '',
  style,
  priority,
  quality = 70,
  sizes,
  draggable,
  placeholderWidth = 64,
  placeholderQuality = 35,
  loading = 'eager',
  onLoad,
  onError,
}: PaintedTitleImageProps) {
  const [loaded, setLoaded] = useState(false)
  const placeholderSrc = useMemo(
    () => buildOptimizedImageUrl(src, placeholderWidth, placeholderQuality),
    [placeholderQuality, placeholderWidth, src],
  )

  useEffect(() => {
    setLoaded(false)
  }, [src])

  return (
    <span className={`inline-grid overflow-visible align-middle ${wrapperClassName}`}>
      <img
        src={placeholderSrc}
        alt=''
        aria-hidden='true'
        className={`col-start-1 row-start-1 scale-105 blur-sm transition-opacity duration-150 ${
          loaded ? 'opacity-0' : 'opacity-65'
        } ${className} ${placeholderClassName}`}
        style={style}
        width={width}
        height={height}
        decoding='async'
        loading='eager'
        draggable={false}
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`col-start-1 row-start-1 ${className}`}
        style={style}
        priority={priority}
        loading={priority ? undefined : loading}
        quality={quality}
        sizes={sizes}
        draggable={draggable}
        onLoad={() => {
          setLoaded(true)
          onLoad?.()
        }}
        onError={() => {
          setLoaded(true)
          onError?.()
        }}
      />
    </span>
  )
}
