'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'

type ImageLightboxProps = {
  image: {
    url: string
    alt?: string
    caption?: string
  } | null
  onClose: () => void
}

export default function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!image) return

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className='fixed right-5 top-5 text-black hover:text-black text-3xl flex items-center justify-center z-50 bg-white/50 rounded-full border-2 p-2 cursor-pointer'
        >
          <Image
            src='/images/close.png'
            alt='Close'
            width={400}
            height={400}
            className='object-contain w-auto h-8'
          />
        </button>

        <motion.div
          className='relative max-w-[95vw] max-h-[95vh] w-auto h-auto'
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='relative w-full h-full'>
            <Image
              src={image.url}
              alt={image.alt || 'Image'}
              width={2000}
              height={2000}
              className='object-contain w-auto h-auto max-w-[95vw] max-h-[95vh]'
              priority
            />
          </div>
          {image.caption && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded text-sm max-w-2xl text-center'>
              {image.caption}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
