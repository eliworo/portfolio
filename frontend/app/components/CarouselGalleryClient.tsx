'use client'

import type { PointerEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import ImageLightbox from './ImageLightbox'
import BlendArrow, { type BlendRect } from './BlendArrow'

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
const LANE_PADDING_TOP_VH = MAX_Y_OFFSET_VH
const LANE_PADDING_BOTTOM_VH = 5
const TAP_MOVE_THRESHOLD_PX = 8

type ArrowBlendState = {
  width: number
  height: number
  rects: BlendRect[]
}

const EMPTY_ARROW_BLEND: ArrowBlendState = {
  width: 0,
  height: 0,
  rects: [],
}

function equalArrowBlendState(a: ArrowBlendState, b: ArrowBlendState) {
  if (a.width !== b.width || a.height !== b.height) return false
  if (a.rects.length !== b.rects.length) return false

  return a.rects.every((rect, index) => {
    const other = b.rects[index]
    return (
      rect.x === other.x &&
      rect.y === other.y &&
      rect.width === other.width &&
      rect.height === other.height
    )
  })
}

export default function CarouselGalleryClient({
  images,
  aspectRatio,
}: {
  images: CarouselImage[]
  aspectRatio: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const tapStartRef = useRef<{ x: number; y: number } | null>(null)
  const leftArrowRef = useRef<HTMLButtonElement>(null)
  const rightArrowRef = useRef<HTMLButtonElement>(null)

  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<CarouselImage | null>(null)
  const [leftArrowBlend, setLeftArrowBlend] =
    useState<ArrowBlendState>(EMPTY_ARROW_BLEND)
  const [rightArrowBlend, setRightArrowBlend] =
    useState<ArrowBlendState>(EMPTY_ARROW_BLEND)

  const scrollStateRafRef = useRef<number | null>(null)
  const measureArrowBlendState = (
    arrow: HTMLButtonElement | null,
  ): ArrowBlendState => {
    const scrollEl = scrollRef.current
    if (!arrow || !scrollEl) return EMPTY_ARROW_BLEND

    const arrowRect = arrow.getBoundingClientRect()
    const mediaEls = Array.from(
      scrollEl.querySelectorAll<HTMLElement>('[data-carousel-media]'),
    )
    const rects = mediaEls.flatMap((mediaEl) => {
      const mediaRect = mediaEl.getBoundingClientRect()
      const x = Math.max(arrowRect.left, mediaRect.left)
      const y = Math.max(arrowRect.top, mediaRect.top)
      const right = Math.min(arrowRect.right, mediaRect.right)
      const bottom = Math.min(arrowRect.bottom, mediaRect.bottom)
      const width = right - x
      const height = bottom - y

      if (width <= 1 || height <= 1) return []

      return [
        {
          x: Math.round(x - arrowRect.left),
          y: Math.round(y - arrowRect.top),
          width: Math.round(width),
          height: Math.round(height),
        },
      ]
    })

    return {
      width: Math.round(arrowRect.width),
      height: Math.round(arrowRect.height),
      rects,
    }
  }

  const updateArrowBlendStates = () => {
    const nextLeft = measureArrowBlendState(leftArrowRef.current)
    const nextRight = measureArrowBlendState(rightArrowRef.current)

    setLeftArrowBlend((prev) =>
      equalArrowBlendState(prev, nextLeft) ? prev : nextLeft,
    )
    setRightArrowBlend((prev) =>
      equalArrowBlendState(prev, nextRight) ? prev : nextRight,
    )
  }

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
      updateArrowBlendStates()
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

  const handleImagePointerDown = (e: PointerEvent) => {
    tapStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleImagePointerUp = (e: PointerEvent, image: CarouselImage) => {
    const start = tapStartRef.current
    tapStartRef.current = null

    if (!start) return

    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y)
    if (moved > TAP_MOVE_THRESHOLD_PX) return

    setLightboxImage(image)
  }

  return (
    <div className='relative group overflow-visible'>
      {/* Arrows: force above everything */}
      {/* Arrows: top row, grouped */}
      <div className='absolute bottom-16 right-0 z-[999] flex items-start pointer-events-none px-4 lg:px-6'>
        <div className='flex items-center gap-3 pointer-events-auto'>
          <button
            ref={leftArrowRef}
            type='button'
            onClick={() => scrollByPage('left')}
            className={`transition-opacity duration-300 relative ${
              showLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label='Previous'
          >
            <BlendArrow
              direction='left'
              bounds={leftArrowBlend}
              blendRects={leftArrowBlend.rects}
              className='h-8 w-[54px] lg:h-10 lg:w-[68px]'
            />
          </button>

          <button
            ref={rightArrowRef}
            type='button'
            onClick={() => scrollByPage('right')}
            className={`transition-opacity duration-300 relative ${
              showRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label='Next'
          >
            <BlendArrow
              direction='right'
              bounds={rightArrowBlend}
              blendRects={rightArrowBlend.rects}
              className='h-8 w-[54px] lg:h-10 lg:w-[68px]'
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
          paddingTop: `${LANE_PADDING_TOP_VH}vh`,
          paddingBottom: `${LANE_PADDING_BOTTOM_VH}vh`,
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
                className='flex-shrink-0 relative m-0 leading-none transition-all duration-200 hover:z-50 cursor-zoom-in'
                onPointerDown={handleImagePointerDown}
                onPointerUp={(e) => handleImagePointerUp(e, image)}
                style={{
                  marginLeft: idx === 0 ? 0 : roundedOverlap,
                  transform: `translate3d(0, ${yOffset}vh, 0)`,
                  willChange: 'transform',
                }}
              >
                <div
                  data-carousel-media
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
                    onLoad={() => requestScrollStateUpdate()}
                  />
                </div>

                {image.caption && (
                  <figcaption className='mt-2 pl-1 text-xs lg:text-sm lg:opacity-0 lg:group-hover:opacity-100 transition-opacity'>
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

      <ImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  )
}
