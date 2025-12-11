'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

interface CarouselImage {
  id: string
  url: string
  alt: string
  caption?: string
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

  // Aspect Ratio logic
  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'landscape'
        ? 'aspect-[16/9]'
        : aspectRatio === 'portrait'
          ? 'aspect-[3/4]'
          : 'aspect-[16/9]'

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      // Show left arrow if we have scrolled > 10px
      setShowLeft(scrollLeft > 10)
      // Show right arrow if we are not at the very end
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

  return (
    <div className='relative group py-6'>
      {/* --- Navigation Arrows --- */}
      {/* Positioned absolute. We use 'translate' to make them slide in/out subtly */}
      <div className='absolute right-2 -bottom-2 lg:-bottom-6 z-20 flex gap-2 pointer-events-none'>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`
            transition-all duration-500 ease-out transform
            ${
              showLeft
                ? 'opacity-100 translate-x-0 pointer-events-auto cursor-pointer'
                : 'opacity-0 translate-x-4 pointer-events-none'
            }
          `}
          aria-label='Scroll Left'
        >
          <div className='hover:scale-105 transition-transform duration-200'>
            <Image
              src='/images/arrowRightLogo.png'
              alt='Previous'
              width={150}
              height={150}
              className='object-contain h-8 lg:h-10 w-auto select-none rotate-180'
            />
          </div>
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`
            transition-all duration-500 ease-out transform
            ${
              showRight
                ? 'opacity-100 translate-x-0 pointer-events-auto cursor-pointer'
                : 'opacity-0 -translate-x-4 pointer-events-none'
            }
          `}
          aria-label='Scroll Right'
        >
          <div className='hover:scale-105 transition-transform duration-200'>
            <Image
              src='/images/arrowRightLogo.png'
              alt='Next'
              width={150}
              height={150}
              className='object-contain h-8 lg:h-10 w-auto select-none'
            />
          </div>
        </button>
      </div>

      {/* --- Scroll Container --- */}
      {/* pb-10 added to ensure absolute captions (-bottom-8) are not cut off */}
      <div
        className='overflow-x-auto no-scrollbar scroll-smooth pb-10'
        ref={scrollRef}
        onScroll={checkScroll}
      >
        <div className='flex gap-0 w-max'>
          {images.map((image, idx) => (
            <figure
              key={idx}
              className={`flex-shrink-0 w-[80vw] max-w-4xl relative ${aspectClass} m-0 leading-none`}
            >
              <div className='relative w-full h-full'>
                <Image
                  src={image.url}
                  alt={image.alt || `Image ${idx + 1}`}
                  fill
                  className='object-cover w-full h-full'
                  draggable={false}
                />

                {/* Caption / Credit */}
                {/* This is positioned below the image. 
                    The parent 'pb-10' ensures this area is visible. */}
                {image.caption && (
                  <figcaption
                    className='absolute -bottom-8 left-0 w-full text-black text-xs lg:text-sm font-medium
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  >
                    {image.caption}
                  </figcaption>
                )}
              </div>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
