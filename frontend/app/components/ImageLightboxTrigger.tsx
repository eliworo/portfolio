'use client'

import { ReactNode, useCallback, useState } from 'react'
import ImageLightbox from './ImageLightbox'

type LightboxImage = {
  url: string
  alt?: string
  caption?: string
}

type ImageLightboxTriggerProps = {
  image: LightboxImage | null
  children: ReactNode
  className?: string
}

export default function ImageLightboxTrigger({
  image,
  children,
  className = '',
}: ImageLightboxTriggerProps) {
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null)

  const openLightbox = useCallback(() => {
    if (!image) return
    setLightboxImage(image)
  }, [image])

  return (
    <>
      <div
        className={`${image ? 'cursor-zoom-in' : ''} ${className}`}
        onClick={openLightbox}
      >
        {children}
      </div>
      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  )
}
