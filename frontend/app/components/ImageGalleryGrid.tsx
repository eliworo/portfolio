'use client'

import { useState } from 'react'
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

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4'>
        {images.map((image, idx) => (
          <figure
            key={idx}
            className='group cursor-pointer'
            onClick={() => setLightboxImage(image)}
          >
            <div className='relative overflow-hidden aspect-square'>
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className='object-cover transition-transform group-hover:scale-105'
              />
            </div>
            {image.caption && (
              <figcaption className='text-sm text-gray-600 mt-2'>
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  )
}
