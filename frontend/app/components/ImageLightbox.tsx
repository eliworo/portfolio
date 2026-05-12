'use client'

import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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

  if (!mounted) return null

  return ReactDOM.createPortal(
    <AnimatePresence>
      {image ? (
        <motion.div
          className='fixed inset-0 z-[2147483647] bg-white/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className='fixed right-3 top-3 sm:right-5 sm:top-5 flex items-center justify-center z-[2147483647] cursor-pointer transition-transform hover:scale-105'
            aria-label='Close image'
          >
            <Image
              src='/images/optimized/close-180.webp'
              alt='Close'
              width={180}
              height={217}
              className='object-contain w-auto h-11 sm:h-12 drop-shadow-sm'
            />
          </button>

          <motion.div
            className='relative flex max-w-[96vw] max-h-[94dvh] w-auto h-auto flex-col items-start'
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative w-auto h-auto'>
              <Image
                src={image.url}
                alt={image.alt || 'Image'}
                width={2000}
                height={2000}
                className={`block object-contain w-auto h-auto max-w-[96vw] ${
                  image.caption ? 'max-h-[calc(94dvh-2.75rem)]' : 'max-h-[94dvh]'
                }`}
                priority
              />
            </div>
            {image.caption && (
              <div className='mt-2 pl-1 max-w-full text-left text-xs sm:text-sm leading-tight text-gray-600'>
                {image.caption}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
