'use client'

import { useMemo, useState } from 'react'
import { Image } from 'next-sanity/image'
import ImageLightbox from './ImageLightbox'

interface ImageGalleryGridProps {
  images: Array<{
    url: string
    alt: string
    caption?: string
  }>
}

export default function ImageGalleryGrid({ images }: ImageGalleryGridProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string
    alt?: string
    caption?: string
  } | null>(null)

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

  // Same deterministic “random” offset logic as your carousel (sin-based seed),
  // but extended to BOTH X and Y for a more playful grid feel.
  const getOffsets = (index: number) => {
    // Deterministic seed
    const seed = index * 12345

    // Two deterministic pseudo-randoms from sin/cos
    const r1 = Math.abs(Math.sin(seed)) * 100
    const r2 = Math.abs(Math.cos(seed)) * 100

    // Base range: -4..4 (matches your carousel vibe)
    let y = (r1 % 8) - 4
    let x = (r2 % 8) - 4

    // Alternation pattern to avoid everything drifting the same way
    if (index % 2 === 1) y *= -1
    if (index % 3 === 1) x *= -1

    // Keep within bounds and round to avoid “jittery” transforms / hydration weirdness
    const yOffset = Math.round(clamp(y, -4, 4) * 100) / 100
    const xOffset = Math.round(clamp(x, -4, 4) * 100) / 100

    return { xOffset, yOffset }
  }

  // Precompute offsets once per images array (stable + avoids rework every render)
  const offsets = useMemo(() => images.map((_, i) => getOffsets(i)), [images])

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4 lg:my-32'>
        {images.map((image, idx) => {
          const { xOffset, yOffset } = offsets[idx] ?? {
            xOffset: 0,
            yOffset: 0,
          }

          return (
            <figure
              key={idx}
              className='group cursor-pointer'
              onClick={() => setLightboxImage(image)}
              style={{
                // Use vh for the same “collage” feel you have in the carousel
                transform: `translate(${xOffset}vh, ${yOffset}vh)`,
              }}
            >
              <div className='relative overflow-hidden aspect-square'>
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className='object-cover transition-transform group-hover:scale-100'
                />
              </div>

              {image.caption && (
                <figcaption className='text-sm text-gray-600 mt-2'>
                  {image.caption}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>

      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  )
}
