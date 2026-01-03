'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import RealBrush from './drawings/RealBrush'

interface CarouselImage {
  id: string
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

const SHOW_THRESHOLD = 10 // px
const MAX_Y_OFFSET_VH = 4
const LANE_PADDING_VH = 6

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

  const scrollStateRafRef = useRef<number | null>(null)
  const requestScrollStateUpdate = () => {
    if (scrollStateRafRef.current) return
    scrollStateRafRef.current = requestAnimationFrame(() => {
      scrollStateRafRef.current = null
      const el = scrollRef.current
      if (!el) return

      const { scrollLeft, scrollWidth, clientWidth } = el
      const nextLeft = scrollLeft > SHOW_THRESHOLD
      const nextRight =
        Math.ceil(scrollLeft + clientWidth) < scrollWidth - SHOW_THRESHOLD

      setShowLeft((prev) => (prev === nextLeft ? prev : nextLeft))
      setShowRight((prev) => (prev === nextRight ? prev : nextRight))
    })
  }

  useEffect(() => {
    requestScrollStateUpdate()

    const onResize = () => requestScrollStateUpdate()
    window.addEventListener('resize', onResize)

    const el = scrollRef.current
    let ro: ResizeObserver | null = null
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => requestScrollStateUpdate())
      ro.observe(el)
      if (el.firstElementChild) ro.observe(el.firstElementChild as Element)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      if (ro) ro.disconnect()
      if (scrollStateRafRef.current)
        cancelAnimationFrame(scrollStateRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fallbackAspect =
    aspectRatio === 'square' ? 1 : aspectRatio === 'portrait' ? 3 / 4 : 16 / 9

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

  const getYOffset = (index: number) => {
    const seed = index * 12345
    const random = Math.abs(Math.sin(seed)) * 100
    const offset = index % 2 === 0 ? (random % 8) - 4 : ((random % 8) - 4) * -1
    return clamp(
      Math.round(offset * 100) / 100,
      -MAX_Y_OFFSET_VH,
      MAX_Y_OFFSET_VH
    )
  }

  const scrollByPage = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.6
    el.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    // IMPORTANT: isolate makes z-index deterministic inside this component
    <div className='relative isolate group py-12 overflow-visible'>
      {/* Arrows: force above everything */}
      {/* Arrows: top row, grouped */}
      <div className='absolute bottom-16 right-0 z-[999] flex items-start pointer-events-none px-4 lg:px-6'>
        <div className='flex items-center gap-3 pointer-events-auto'>
          <button
            type='button'
            onClick={() => scrollByPage('left')}
            className={`transition-opacity duration-300 relative ${
              showLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label='Previous'
          >
            <div className='absolute inset-x-0 top-1/2 -translate-y-[45%] -z-10 pointer-events-none'>
              <RealBrush
                seed='carousel-arrow:left'
                color='#eee'
                className='absolute -inset-x-3 -inset-y-4'
                style={{ height: 44 }}
              />
            </div>

            <Image
              src='/images/arrowRightLogo.png'
              alt='Previous'
              width={150}
              height={150}
              className='h-8 lg:h-10 w-auto rotate-180 relative z-10'
              draggable={false}
              priority
            />
          </button>

          <button
            type='button'
            onClick={() => scrollByPage('right')}
            className={`transition-opacity duration-300 relative ${
              showRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label='Next'
          >
            <div className='absolute inset-x-0 top-1/2 -translate-y-[45%] -z-10 pointer-events-none'>
              <RealBrush
                seed='carousel-arrow:right'
                color='#eee'
                className='absolute -inset-x-3 -rotate-180 -inset-y-6'
                style={{ height: 44 }}
              />
            </div>

            <Image
              src='/images/arrowRightLogo.png'
              alt='Next'
              width={150}
              height={150}
              className='h-8 lg:h-10 w-auto relative z-10'
              draggable={false}
              priority
            />
          </button>
        </div>
      </div>

      {/* Scroll lane */}
      <div
        ref={scrollRef}
        onScroll={requestScrollStateUpdate}
        className='overflow-x-auto overflow-y-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none]'
        style={{
          paddingTop: `${LANE_PADDING_VH}vh`,
          paddingBottom: `${LANE_PADDING_VH}vh`,
        }}
      >
        <div className='flex w-max items-end'>
          {images.map((image, idx) => {
            const w = image.width ?? 1600
            const h = image.height ?? Math.round(1600 / fallbackAspect)
            const ratio = w / h

            const BASE_OVERLAP_PX = -400
            const ratioAdjustment = (ratio - 1.2) * -8

            const overlap = clamp(BASE_OVERLAP_PX + ratioAdjustment, -1200, -20)

            const roundedOverlap = Math.round(overlap)

            const yOffset = getYOffset(idx)

            return (
              <figure
                key={image.id ?? String(idx)}
                className='flex-shrink-0 relative m-0 leading-none'
                style={{
                  marginLeft: idx === 0 ? 0 : roundedOverlap,
                  transform: `translate3d(0, ${yOffset}vh, 0)`,
                  willChange: 'transform',
                }}
              >
                <div
                  className='relative h-[52vh] sm:h-[56vh] lg:h-[62vh] max-h-[680px]'
                  style={{
                    aspectRatio: `${w}/${h}`,
                    width: 'auto',
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${idx + 1}`}
                    fill
                    draggable={false}
                    sizes='(min-width: 1024px) 800px, 80vw'
                    className='object-contain object-left select-none'
                    onLoadingComplete={() => requestScrollStateUpdate()}
                  />
                </div>

                {image.caption && (
                  <figcaption className='mt-2 pl-1 text-xs lg:text-sm opacity-0 group-hover:opacity-100 transition-opacity'>
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
