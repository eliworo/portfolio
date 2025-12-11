'use client' // Required for interaction

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PaintBrush from './drawings/PaintBrush'

interface NewsPostIt {
  title?: string
  date?: string
  description?: string
  linkUrl?: string
  linkText?: string
  postItImage?: { asset?: { url: string } }
  titleImage?: { asset?: { url: string } }
}

// Define positions outside component to prevent re-creation on render
const POSITIONS = [
  { top: '15%', left: '10%', rotate: -2 },
  { top: '45%', left: '40%', rotate: 3 },
  { top: '20%', left: '55%', rotate: 1 },
  { top: '60%', left: '15%', rotate: -3 },
]

export default function NewsPostIts({ news }: { news: NewsPostIt[] }) {
  // Use a ref for the container to constrain dragging (optional, keeps them on screen)
  const containerRef = useRef<HTMLDivElement>(null)

  // Local state to manage which items are visible
  // We attach the 'initialIndex' to ensure they stay in their visual spot even if others close
  const [activeItems, setActiveItems] = useState(() =>
    news.map((item, index) => ({ ...item, id: index, initialIndex: index }))
  )

  const handleClose = (id: number) => {
    setActiveItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (!activeItems.length) return null

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 z-40 pointer-events-none overflow-hidden'
    >
      {/* Container restricted to right half on desktop */}
      <div className='absolute top-0 right-0 w-full h-full lg:w-1/2 pointer-events-auto'>
        {/* AnimatePresence handles the exit animation when an item is removed */}
        <AnimatePresence mode='popLayout'>
          {activeItems.map((item) => {
            const pos = POSITIONS[item.initialIndex % POSITIONS.length]
            const hasCustomBg = !!item.postItImage?.asset?.url

            return (
              <motion.div
                key={item.id}
                // --- DRAG SETTINGS ---
                drag
                dragConstraints={containerRef} // Keeps it generally within bounds
                dragElastic={0.2} // Adds a nice resistance feeling at edges
                dragMomentum={false} // Stops it sliding forever on mobile
                // --- ANIMATION SETTINGS ---
                initial={{ opacity: 0, scale: 0.8, rotate: pos.rotate }}
                animate={{ opacity: 1, scale: 1, rotate: pos.rotate }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.02, zIndex: 50, cursor: 'grab' }}
                whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
                // --- STYLING ---
                className={`absolute w-[240px] md:w-[280px] min-h-[280px] flex flex-col items-center ${
                  !hasCustomBg
                    ? 'bg-white border-[3px] border-black shadow-lg'
                    : 'shadow-none border-none bg-transparent'
                }`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  borderRadius: !hasCustomBg
                    ? '2px 4px 2px 255px / 255px 5px 225px 5px'
                    : '0',
                }}
              >
                {/* 1. CUSTOM BACKGROUND IMAGE */}
                {item.postItImage?.asset?.url && (
                  <div className='absolute inset-0 z-0 pointer-events-none'>
                    <Image
                      src={item.postItImage.asset.url}
                      alt=''
                      fill
                      className='object-fill'
                      sizes='(max-width: 768px) 240px, 280px'
                      draggable={false} // Prevent browser native image dragging
                    />
                  </div>
                )}

                {/* CLOSE BUTTON - Using 'pointerDown' to prevent drag conflict */}
                <button
                  onPointerDown={(e) => {
                    e.stopPropagation() // Prevents drag start when clicking X
                  }}
                  onClick={() => handleClose(item.id)}
                  className={`absolute top-12 right-7 select-none cursor-pointer z-20 opacity-70 hover:opacity-100 transition-opacity ${
                    hasCustomBg ? 'text-black' : ''
                  }`}
                  aria-label='Close news note'
                >
                  <Image
                    src='/images/close.png'
                    alt='Close menu'
                    width={200}
                    height={200}
                    className='object-contain w-auto h-8'
                  />
                </button>

                {/* CONTENT WRAPPER */}
                <div
                  className={`relative z-10 flex flex-col gap-1 text-black h-full justify-center w-full ${
                    hasCustomBg ? 'p-12' : 'p-6'
                  }`}
                >
                  {/* TITLE */}
                  {item.titleImage?.asset?.url ? (
                    <div className='mb-2 w-full relative h-10 pointer-events-none'>
                      <Image
                        src={item.titleImage.asset.url}
                        alt={item.title || 'News'}
                        fill
                        className='object-contain object-left'
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
                    <p className='text-sm whitespace-pre-line leading-tight select-none'>
                      {item.description}
                    </p>
                  )}

                  {/* LINK (Needs stopPropagation so clicking link doesn't trigger drag) */}
                  {item.linkUrl && (
                    <div
                      className='mt-3'
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={item.linkUrl}
                        className='inline-block relative relative group'
                        target='_blank'
                      >
                        {/* <span className='absolute inset-0 bg-blue-200/50 -skew-x-6 transform -rotate-1 rounded-sm group-hover:bg-blue-300/60 transition-colors'></span> */}
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
