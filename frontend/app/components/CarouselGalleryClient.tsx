'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

interface CarouselImage {
  id: string
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export default function CarouselGalleryClient({
  images,
  aspectRatio,
}: {
  images: CarouselImage[]
  aspectRatio: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeft(scrollLeft > 10)
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.6
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  // fallback aspect if metadata missing
  const fallbackAspect =
    aspectRatio === 'square' ? 1 : aspectRatio === 'portrait' ? 3 / 4 : 16 / 9

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

  // Generate consistent random Y offsets for each image
  const getYOffset = (index: number) => {
    // Use index as seed for consistent randomness
    const seed = index * 12345
    const random = Math.abs(Math.sin(seed)) * 100
    // Alternate between positive and negative, with values between -8vh and 8vh
    const offset =
      index % 2 === 0
        ? (random % 8) - 4 // -4 to 4vh
        : ((random % 8) - 4) * -1 // inverted for alternating pattern

    // Round to 2 decimals to avoid hydration mismatch
    return Math.round(offset * 100) / 100
  }

  return (
    <div className='relative group py-12 overflow-hidden'>
      {/* Arrows - closer spacing */}
      <div className='absolute right-0 top-1/2 -translate-y-1/2 z-50 flex gap-2 pointer-events-none'>
        <button
          onClick={() => scroll('left')}
          className={`transition-all duration-500 ${
            showLeft
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src='/images/arrowRightLogo.png'
            alt='Previous'
            width={150}
            height={150}
            className='h-8 lg:h-10 w-auto rotate-180'
          />
          {/* <span className='text-6xl font-garabosse-gaillarde'>←</span> */}
        </button>

        <button
          onClick={() => scroll('right')}
          className={`transition-all duration-500 ${
            showRight
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src='/images/arrowRightLogo.png'
            alt='Next'
            width={150}
            height={150}
            className='h-8 lg:h-10 w-auto'
          />
          {/* <span className='text-6xl font-garabosse-gaillarde'>→</span> */}
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className='overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth pb-10'
      >
        <div className='flex w-max items-center'>
          {images.map((image, idx) => {
            const w = image.width ?? 1600
            const h = image.height ?? Math.round(1600 / fallbackAspect)
            const ratio = w / h

            // Increased overlap for collage effect
            const baseOverlap = -80
            const ratioAdjustment = (ratio - 1.6) * -15
            const overlap = clamp(baseOverlap + ratioAdjustment, -120, -40)

            // Round to 2 decimals to avoid hydration mismatch
            const roundedOverlap = Math.round(overlap * 100) / 100

            // Get Y offset for this image
            const yOffset = getYOffset(idx)

            return (
              <figure
                key={image.id ?? idx}
                className='flex-shrink-0 relative m-0 leading-none h-[52vh] sm:h-[56vh] lg:h-[62vh] max-h-[680px] w-[80vw] max-w-4xl'
                style={{
                  marginLeft: idx === 0 ? 0 : roundedOverlap,
                  transform: `translateY(${yOffset}vh)`,
                }}
              >
                <div className='relative w-full h-full'>
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${idx + 1}`}
                    fill
                    draggable={false}
                    sizes='(min-width: 1024px) 800px, 80vw'
                    className='object-contain object-left'
                  />

                  {image.caption && (
                    <figcaption className='absolute bottom-0 left-1 text-xs lg:text-sm opacity-0 group-hover:opacity-100 transition-opacity'>
                      {image.caption}
                    </figcaption>
                  )}
                </div>
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}
