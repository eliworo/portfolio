'use client' // Required for interaction

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PaintBrush from './drawings/PaintBrush'
import PaintedTitleImage from './PaintedTitleImage'

interface NewsPostIt {
  title?: string
  date?: string
  description?: string
  linkUrl?: string
  linkText?: string
  postItImage?: { asset?: { url: string } }
  titleImage?: { asset?: { url: string } }
}

const DESKTOP_POSITIONS = [
  { top: '2%', left: '16%', rotate: -2 },
  { top: '56%', left: '20%', rotate: 3 },
  { top: '22%', right: '5%', rotate: 1 },
  { top: '58%', right: '24%', rotate: -3 },
  { top: '8%', right: '32%', rotate: 2 },
] as const

// Mobile stack order is left -> right (1, 2, 3), with #3 visually on top.
const MOBILE_STACK_POSITIONS = [
  { left: '6%', bottom: '8%', rotate: -6, zIndex: 20 },
  { left: '24%', bottom: '13%', rotate: -1, zIndex: 30 },
  { left: '42%', bottom: '16%', rotate: 4, zIndex: 40 },
] as const

export default function NewsPostIts({ news }: { news: NewsPostIt[] }) {
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * This key forces Framer Motion to REMOUNT
   * when crossing the lg breakpoint.
   * That resets transforms (drag, x jitter, etc.)
   */
  const [breakpointKey, setBreakpointKey] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')

    const onChange = () => {
      setBreakpointKey((k) => k + 1)
      setIsDesktop(mq.matches)
    }

    setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Keep initial positions stable even if items are closed
  const [activeItems, setActiveItems] = useState(() =>
    news.map((item, index) => ({ ...item, id: index, initialIndex: index })),
  )

  const handleClose = (id: number) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (!activeItems.length) return null

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 z-20 pointer-events-none overflow-hidden'
    >
      {/* Post-it lane: visual layout only */}
      <div
        className={[
          'absolute pointer-events-none',
          // Mobile: original stacked card lane.
          'left-0 right-0 top-0 bottom-0',
          // Desktop: right side only, with enough room to avoid collisions.
          'lg:translate-x-0 lg:left-[54%] lg:right-[1.5%] lg:w-auto lg:max-w-none',
          'lg:top-[6%] lg:bottom-[6%]',
        ].join(' ')}
      >
        {/* KEY forces remount on breakpoint change */}
        <AnimatePresence mode='popLayout' key={breakpointKey}>
          {activeItems.map((item) => {
            const desktopPos =
              DESKTOP_POSITIONS[item.initialIndex % DESKTOP_POSITIONS.length]
            const mobilePos =
              MOBILE_STACK_POSITIONS[
                item.initialIndex % MOBILE_STACK_POSITIONS.length
              ]
            const mobileLayer = Math.floor(
              item.initialIndex / MOBILE_STACK_POSITIONS.length,
            )
            const hasCustomBg = !!item.postItImage?.asset?.url

            // small messy offset (applies everywhere, but gets reset on breakpoint)
            const xJitter = ((item.initialIndex % 3) - 1) * 18 // -18, 0, +18
            const rotate = isDesktop ? desktopPos.rotate : mobilePos.rotate
            const xOffset = isDesktop ? xJitter : 0

            return (
              <motion.div
                key={item.id}
                drag
                dragConstraints={containerRef}
                dragElastic={0.2}
                dragMomentum={false}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  rotate,
                  x: xOffset,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate,
                  x: xOffset,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  transition: { duration: 0.2 },
                }}
                whileHover={
                  isDesktop ? { scale: 1.02, zIndex: 50, cursor: 'grab' } : {}
                }
                whileDrag={
                  isDesktop
                    ? { scale: 1.08, zIndex: 100, cursor: 'grabbing' }
                    : {}
                }
                className={[
                  'absolute w-[58vw] max-w-[230px] min-h-[220px]',
                  'md:w-[280px] md:min-h-[280px]',
                  'lg:w-[clamp(220px,18vw,280px)] lg:min-h-[260px]',
                  'flex flex-col items-center pointer-events-auto',
                  // Desktop: override mobile left positioning
                  'left-0',
                  'lg:translate-x-0',
                  !hasCustomBg
                    ? 'bg-white border-[3px] border-black shadow-lg'
                    : 'shadow-none border-none bg-transparent',
                ].join(' ')}
                style={{
                  ...(isDesktop
                    ? {
                        top: desktopPos.top,
                        left: 'left' in desktopPos ? desktopPos.left : 'auto',
                        right:
                          'right' in desktopPos ? desktopPos.right : 'auto',
                        zIndex: 10 + item.initialIndex,
                      }
                    : {
                        left: mobilePos.left,
                        bottom: `calc(${mobilePos.bottom} + ${mobileLayer * 14}px)`,
                        zIndex: mobilePos.zIndex + mobileLayer,
                      }),
                  borderRadius: !hasCustomBg
                    ? '2px 4px 2px 255px / 255px 5px 225px 5px'
                    : '0',
                  touchAction: 'none',
                }}
              >
                {/* Background image */}
                {item.postItImage?.asset?.url && (
                  <div className='absolute inset-0 z-0 pointer-events-none opacity-70'>
                    <Image
                      src={item.postItImage.asset.url}
                      alt=''
                      fill
                      className='object-fill'
                      sizes='(max-width: 768px) 240px, 280px'
                      draggable={false}
                    />
                  </div>
                )}

                {/* Close button */}
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handleClose(item.id)}
                  className='absolute top-16 right-7 z-20 opacity-70 hover:opacity-100 transition-opacity'
                  aria-label='Close news note'
                >
                  <Image
                    src='/images/optimized/close-180.webp'
                    alt='Close'
                    width={180}
                    height={217}
                    draggable={false}
                    className='object-contain h-5 w-auto
                      drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]
                      drop-shadow-[0_2px_0_rgba(0,0,0,0.18)]'
                  />
                </button>

                {/* Content */}
                <div
                  className={[
                    'relative z-10 flex flex-col gap-1 text-black h-full justify-center w-full',
                    hasCustomBg ? 'px-10 py-12' : 'p-6',
                  ].join(' ')}
                >
                  {item.titleImage?.asset?.url ? (
                    <div className='mt-2 mb-2 w-full relative h-10 pointer-events-none'>
                      <PaintedTitleImage
                        src={item.titleImage.asset.url}
                        alt={item.title || 'News'}
                        width={320}
                        height={80}
                        sizes='280px'
                        className='object-contain object-left h-10 w-auto max-w-full'
                        draggable={false}
                      />
                    </div>
                  ) : (
                    item.title && (
                      <h3 className='text-3xl uppercase tracking-wide mb-2 select-none'>
                        {item.title}
                      </h3>
                    )
                  )}

                  {item.date && (
                    <p className='text-sm font-bold select-none'>{item.date}</p>
                  )}

                  {item.description && (
                    <p className='text-sm whitespace-pre-line leading-snug select-none'>
                      {item.description}
                    </p>
                  )}

                  {item.linkUrl && (
                    <div
                      className='mt-3'
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={item.linkUrl}
                        className='inline-block relative group'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <span className='relative text-sm font-bold flex items-center gap-1 px-1'>
                          ≈&gt; {item.linkText || 'MORE INFO'}
                        </span>
                        <PaintBrush
                          className='absolute top-1/2 -translate-y-[45%] -rotate-1 w-[110%] h-[80%] -z-10'
                          theme={{ fill: '#FFBD9A' }}
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
