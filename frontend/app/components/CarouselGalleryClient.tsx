'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface CarouselImage {
  id: string
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

type Dir = 'left' | 'right' | null

const DRIFT_MAX = 220 // px/s on hover
const HOLD_MAX = 1100 // px/s on hold
const SHOW_THRESHOLD = 10 // px
const EDGE_SOFTEN_PX = 180 // ease near edges
const DEAD_ZONE = 0.12 // center deadzone (0..0.5)
const ARROW_FOLLOW = 0.18 // 0..1, bigger = snappier follow
const STOP_EPS = 6 // px/s

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)

function computeSpeedFromZoneX(x01: number, maxSpeed: number) {
  // x01 is 0..1 where 0 = zone edge (fast), 0.5 = center (slow), 1 = far edge (fast)
  // We want speed by distance from center with a deadzone.
  const dist = Math.abs(x01 - 0.5) * 2 // 0..1
  const curved = easeOutCubic(dist)
  const intent = Math.max(0, (curved - DEAD_ZONE) / (1 - DEAD_ZONE))
  return intent * maxSpeed
}

export default function CarouselGalleryClient({
  images,
  aspectRatio,
}: {
  images: CarouselImage[]
  aspectRatio: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // UI state
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const [hoverDir, setHoverDir] = useState<Dir>(null)

  // hot refs
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number>(0)

  const dirRef = useRef<Dir>(null)
  const holdingRef = useRef(false)

  const targetSpeedRef = useRef(0) // px/s
  const speedRef = useRef(0) // px/s (smoothed)

  // arrow follow via CSS var (no transform overwrites)
  const arrowDyRef = useRef(0) // px, smoothed
  const arrowDyTargetRef = useRef(0) // px
  const arrowDyVarHostRef = useRef<HTMLDivElement | null>(null)

  // Throttle left/right visibility updates
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

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    lastTRef.current = 0
    dirRef.current = null
    targetSpeedRef.current = 0
    speedRef.current = 0
  }

  const edgeEaseFactor = (el: HTMLDivElement, dir: Exclude<Dir, null>) => {
    const max = el.scrollWidth - el.clientWidth
    const leftDist = el.scrollLeft
    const rightDist = max - el.scrollLeft
    const dist = dir === 'left' ? leftDist : rightDist
    if (dist <= 0) return 0
    if (dist < EDGE_SOFTEN_PX) return dist / EDGE_SOFTEN_PX
    return 1
  }

  const tick = (t: number) => {
    const el = scrollRef.current
    const dir = dirRef.current
    if (!el || !dir) {
      stop()
      return
    }

    if (!lastTRef.current) lastTRef.current = t
    const dt = Math.min(0.05, (t - lastTRef.current) / 1000)
    lastTRef.current = t

    // inertial speed towards target
    const accel = holdingRef.current ? 22 : 12
    const k = 1 - Math.exp(-accel * dt)
    speedRef.current += (targetSpeedRef.current - speedRef.current) * k

    // arrow follow smoothing (CSS var)
    arrowDyRef.current +=
      (arrowDyTargetRef.current - arrowDyRef.current) * ARROW_FOLLOW
    if (arrowDyVarHostRef.current) {
      arrowDyVarHostRef.current.style.setProperty(
        '--arrow-dy',
        `${arrowDyRef.current.toFixed(2)}px`
      )
    }

    const speed = speedRef.current
    const factor = edgeEaseFactor(el, dir)
    const signed = dir === 'left' ? -1 : 1
    const delta = speed * factor * dt * signed

    // stop when easing to zero and not actively targeting movement
    if (Math.abs(speed) < STOP_EPS && targetSpeedRef.current === 0) {
      stop()
      requestScrollStateUpdate()
      return
    }

    // apply scroll
    el.scrollLeft += delta

    // stop on edges
    const max = el.scrollWidth - el.clientWidth
    const atLeft = el.scrollLeft <= 0
    const atRight = el.scrollLeft >= max - 1
    if (
      (dir === 'left' && atLeft) ||
      (dir === 'right' && atRight) ||
      factor === 0
    ) {
      stop()
      requestScrollStateUpdate()
      return
    }

    requestScrollStateUpdate()
    rafRef.current = requestAnimationFrame(tick)
  }

  const ensureRunning = () => {
    if (!rafRef.current) {
      lastTRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  // pointer-zone logic (nonlinear + stable)
  const onZoneMove =
    (dir: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
      const zone = e.currentTarget
      const r = zone.getBoundingClientRect()

      // normalized within this half
      const x01 = clamp01((e.clientX - r.left) / r.width)

      // for left zone: faster near left edge => use (1 - x01) as "toward edge"
      // for right zone: faster near right edge => use x01
      const towardEdge = dir === 'left' ? 1 - x01 : x01

      // convert to "center-based" curve: we want calm near center of *this half*
      // So remap towardEdge [0..1] -> center at 0.5
      const curveX = towardEdge

      // pick max speed based on hold vs hover
      const maxSpeed = holdingRef.current ? HOLD_MAX : DRIFT_MAX

      // gate if cannot scroll that direction
      if ((dir === 'left' && !showLeft) || (dir === 'right' && !showRight)) {
        targetSpeedRef.current = 0
        dirRef.current = dir
        ensureRunning()
        return
      }

      dirRef.current = dir
      targetSpeedRef.current = computeSpeedFromZoneX(curveX, maxSpeed)

      // arrow follow target: dy relative to center of the overlay (px)
      const yInZone = clamp01((e.clientY - r.top) / r.height) // 0..1
      arrowDyTargetRef.current = (yInZone - 0.5) * r.height

      // state updates only when dir changes
      setHoverDir((prev) => (prev === dir ? prev : dir))

      ensureRunning()
    }

  const onZoneEnter =
    (dir: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
      holdingRef.current = false
      // do not hard-reset speed; let inertia feel natural
      onZoneMove(dir)(e)
    }

  const onZoneDown =
    (dir: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      holdingRef.current = true
      onZoneMove(dir)(e)
    }

  const onZoneUp =
    (dir: 'left' | 'right') => (e: React.PointerEvent<HTMLDivElement>) => {
      holdingRef.current = false
      // continue drift based on current pointer position
      onZoneMove(dir)(e)
    }

  const onLeaveAll = () => {
    setHoverDir(null)
    holdingRef.current = false
    targetSpeedRef.current = 0
    // arrow returns to center smoothly
    arrowDyTargetRef.current = 0
    ensureRunning()
  }

  // initial / resize
  useEffect(() => {
    requestScrollStateUpdate()
    const onResize = () => requestScrollStateUpdate()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      stop()
      if (scrollStateRafRef.current)
        cancelAnimationFrame(scrollStateRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fallback aspect
  const fallbackAspect =
    aspectRatio === 'square' ? 1 : aspectRatio === 'portrait' ? 3 / 4 : 16 / 9

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v))

  const getYOffset = (index: number) => {
    const seed = index * 12345
    const random = Math.abs(Math.sin(seed)) * 100
    const offset = index % 2 === 0 ? (random % 8) - 4 : ((random % 8) - 4) * -1
    return Math.round(offset * 100) / 100
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
    <div
      className={[
        'relative group py-12 overflow-hidden',
        hoverDir === 'left' ? 'cursor-w-resize' : '',
        hoverDir === 'right' ? 'cursor-e-resize' : '',
      ].join(' ')}
    >
      {/* Desktop hover zones */}
      <div
        className='absolute inset-0 z-50 hidden lg:block'
        onPointerLeave={onLeaveAll}
      >
        {/* left half */}
        <div
          className='absolute left-0 top-0 h-full w-1/2'
          onPointerEnter={onZoneEnter('left')}
          onPointerMove={onZoneMove('left')}
          onPointerDown={onZoneDown('left')}
          onPointerUp={onZoneUp('left')}
        />
        {/* right half */}
        <div
          className='absolute right-0 top-0 h-full w-1/2'
          onPointerEnter={onZoneEnter('right')}
          onPointerMove={onZoneMove('right')}
          onPointerDown={onZoneDown('right')}
          onPointerUp={onZoneUp('right')}
        />

        {/* Overlay arrow - uses CSS var for Y motion to avoid transform conflicts */}
        <div className='pointer-events-none absolute inset-0'>
          <div
            ref={arrowDyVarHostRef}
            className={[
              'absolute top-1/2 transition-opacity duration-200',
              hoverDir ? 'opacity-100' : 'opacity-0',
              hoverDir === 'left' ? 'left-6' : 'right-6',
            ].join(' ')}
            style={{
              opacity:
                hoverDir === 'left'
                  ? showLeft
                    ? 1
                    : 0
                  : hoverDir === 'right'
                    ? showRight
                      ? 1
                      : 0
                    : 0,
              transform: 'translate3d(0, calc(-50% + var(--arrow-dy, 0px)), 0)',
              willChange: 'transform',
            }}
          >
            <Image
              src='/images/arrowRightLogo.png'
              alt={hoverDir === 'left' ? 'Previous' : 'Next'}
              width={150}
              height={150}
              draggable={false}
              className={[
                'h-10 w-auto select-none',
                hoverDir === 'left' ? 'rotate-180' : '',
              ].join(' ')}
            />
          </div>
        </div>
      </div>

      {/* Mobile arrows */}
      <div className='absolute right-2 top-1/2 -translate-y-1/2 z-50 flex gap-2 pointer-events-none lg:hidden'>
        <button
          onClick={() => scrollByPage('left')}
          className={`transition-all duration-300 ${
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
            className='h-8 w-auto rotate-180'
            draggable={false}
          />
        </button>

        <button
          onClick={() => scrollByPage('right')}
          className={`transition-all duration-300 ${
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
            className='h-8 w-auto'
            draggable={false}
          />
        </button>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={requestScrollStateUpdate}
        className='overflow-x-auto overflow-y-hidden no-scrollbar pb-10 [scrollbar-width:none] [-ms-overflow-style:none]'
      >
        <div className='flex w-max items-center'>
          {images.map((image, idx) => {
            const w = image.width ?? 1600
            const h = image.height ?? Math.round(1600 / fallbackAspect)
            const ratio = w / h

            const baseOverlap = -80
            const ratioAdjustment = (ratio - 1.6) * -15
            const overlap = clamp(baseOverlap + ratioAdjustment, -120, -40)

            const roundedOverlap = Math.round(overlap * 100) / 100
            const yOffset = getYOffset(idx)

            return (
              <figure
                key={image.id ?? String(idx)}
                className='flex-shrink-0 relative m-0 leading-none h-[52vh] sm:h-[56vh] lg:h-[62vh] max-h-[680px] w-[80vw] max-w-4xl'
                style={{
                  marginLeft: idx === 0 ? 0 : roundedOverlap,
                  transform: `translate3d(0, ${yOffset}vh, 0)`,
                  willChange: 'transform',
                }}
              >
                <div className='relative w-full h-full'>
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${idx + 1}`}
                    fill
                    draggable={false}
                    sizes='(min-width: 1024px) 800px, 80vw'
                    className='object-contain object-left select-none'
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

      {/* Hide scrollbar for Webkit */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
