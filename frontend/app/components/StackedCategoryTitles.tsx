'use client'

import ReactDOM from 'react-dom'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import RealBrush from './drawings/RealBrush'
import VerticalLine from './lines/VerticalLine'

/** =========================================
 * Types
 * ========================================= */

export interface CategoryItem {
  id: string
  title: string
  titleImageUrl?: string
}

export type GroupTitleImages = {
  horizontal?: string
  studio?: string
  works?: string
}

export type TitleVariant = 'horizontal' | 'stacked'

export interface StackedCategoryTitlesProps {
  groupTitleImageUrl?: string
  groupTitleImages?: GroupTitleImages
  titleVariant?: TitleVariant
  groupTitle?: string
  hideGroupTitle?: boolean
  showAllCategories?: boolean
  categories: CategoryItem[]
  selectedCategory: string | null
  onSelectCategory: (id: string | null) => void
}

/** =========================================
 * Helpers
 * ========================================= */

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** One brush color only */
const BRUSH_COLOR = '#D9D9D9'

/**
 * Single knob for sizing.
 * 1 = current; 0.85 = 15% smaller; tweak as needed.
 */
const SCALE = 0.75

// Derived “rhythm” numbers so spacing stays proportional
const ITEM_GAP = Math.round(65 * SCALE)
const TOP_PAD = Math.round(20 * SCALE)
const BOTTOM_PAD = Math.round(20 * SCALE)
const BRUSH_H_PX = Math.round(56 * SCALE) // h-14 is ~56px
const IMG_MAX_H_PX = Math.round(55 * SCALE) // old lg max-h ~55px (close enough)
const MOBILE_BRUSH_H_PX = Math.round(BRUSH_H_PX * 1)

/** =========================================
 * Component
 * ========================================= */

export default function StackedCategoryTitles({
  groupTitleImageUrl,
  groupTitleImages,
  titleVariant = 'horizontal',
  groupTitle,
  categories,
  selectedCategory,
  onSelectCategory,
  hideGroupTitle,
  showAllCategories = true,
}: StackedCategoryTitlesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const mobileHandleRef = useRef<HTMLButtonElement>(null)
  const [mobileContentWidth, setMobileContentWidth] = useState(0)
  const [mobileHandleWidth, setMobileHandleWidth] = useState(0)
  const [mobileMeasured, setMobileMeasured] = useState(false)

  const getCategoryRotation = (id: string) => {
    const hash = hashString(id + 'rotation')
    return (hash % 7) - 3.5
  }

  const getCategoryOffset = (id: string, index: number) => {
    const hash = hashString(id + 'offset')
    const xOffset = ((hash % 20) - 10) * 0.3
    const yOffset = index * ITEM_GAP
    return { x: xOffset, y: yOffset }
  }

  const navCategories = useMemo(() => {
    if (!showAllCategories) return categories

    return [
      {
        id: '__all__',
        title: 'All categories',
        titleImageUrl: '/images/AllCategoriesLogo.png',
      },
      ...categories,
    ]
  }, [categories, showAllCategories])

  // Give the stack a real height so the panel isn’t 0px tall
  const stackHeight = useMemo(() => {
    return TOP_PAD + navCategories.length * ITEM_GAP + BOTTOM_PAD
  }, [navCategories.length])

  // Resolve images with safe fallback to legacy prop
  const images: GroupTitleImages = useMemo(() => {
    const merged = { ...(groupTitleImages || {}) } as GroupTitleImages
    if (!merged.horizontal && groupTitleImageUrl)
      merged.horizontal = groupTitleImageUrl
    return merged
  }, [groupTitleImages, groupTitleImageUrl])

  const canUseStacked = Boolean(images.studio && images.works)
  const effectiveVariant: TitleVariant =
    titleVariant === 'stacked' && canUseStacked ? 'stacked' : 'horizontal'
  const mobileHideOffset = mobileMeasured
    ? Math.max(0, mobileContentWidth - mobileHandleWidth + 10)
    : 1000

  useEffect(() => {
    if (!mobileContentRef.current || !mobileHandleRef.current) return

    const updateWidths = () => {
      if (mobileContentRef.current && mobileHandleRef.current) {
        setMobileContentWidth(mobileContentRef.current.offsetWidth)
        setMobileHandleWidth(mobileHandleRef.current.offsetWidth)
        setMobileMeasured(true)
      }
    }

    const timer = setTimeout(updateWidths, 10)
    const observer = new ResizeObserver(updateWidths)
    observer.observe(mobileContentRef.current)
    observer.observe(mobileHandleRef.current)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [categories, selectedCategory])

  return (
    <>
      {/* =========================================
          Group Title (supports stacked + horizontal)
         ========================================= */}
      {!hideGroupTitle && (
        <div
          className='
    px-4 lg:px-0
    relative md:max-lg:absolute lg:absolute
    mt-32 ml-12 sm:mt-20 md:max-lg:mt-0 lg:mt-0
    -rotate-3 md:max-lg:rotate-0 lg:rotate-0
    left-auto md:max-lg:left-8 lg:left-22
    top-auto md:max-lg:top-16 lg:top-16
    w-[85vw] md:max-lg:w-[30vw] lg:w-[40vw]
    md:max-lg:max-w-[320px]
    mx-auto md:max-lg:mx-0 lg:mx-0
    z-20
    pointer-events-none
  '
        >
          {' '}
          <div className='mb-8 lg:mb-12'>
            {effectiveVariant === 'stacked' ? (
              <div
                className='relative w-full max-w-[680px]'
                style={{
                  height: 'clamp(180px, 18vw, 260px)',
                }}
              >
                {/* STUDIO — clickable only on the STUDIO image area */}
                <button
                  type='button'
                  onClick={() => onSelectCategory(null)}
                  className='absolute left-0 top-0 origin-left rotate-[0deg] pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
                  aria-label='Reset category filter (Studio)'
                >
                  <Image
                    src={images.studio!}
                    alt={groupTitle ? `${groupTitle} — Studio` : 'Studio'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{ maxHeight: Math.round(140 * SCALE) }}
                    priority
                    sizes='(max-width: 767px) 85vw, (max-width: 1023px) 30vw, 680px'
                  />
                </button>

                {/* WORKS — clickable only on the WORKS image area */}
                <button
                  type='button'
                  onClick={() => onSelectCategory(null)}
                  className='absolute left-[18.5%] top-[52%] origin-left rotate-[2deg] pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
                  aria-label='Reset category filter (Works)'
                >
                  <Image
                    src={images.works!}
                    alt={groupTitle ? `${groupTitle} — Works` : 'Works'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{ maxHeight: Math.round(140 * SCALE) }}
                    priority
                    sizes='(max-width: 767px) 85vw, (max-width: 1023px) 30vw, 680px'
                  />
                </button>
              </div>
            ) : images.horizontal ? (
              // Horizontal variant: clickable only on the image itself
              <button
                type='button'
                onClick={() => onSelectCategory(null)}
                className='pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
                aria-label='Reset category filter'
              >
                <Image
                  src={images.horizontal}
                  alt={groupTitle || 'Studio Works'}
                  width={800}
                  height={200}
                  className='object-contain h-auto w-auto'
                  style={{ maxHeight: Math.round(120 * SCALE) }}
                  priority
                  sizes='(max-width: 1024px) 80vw, 600px'
                />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================
          Stacked Category Titles (fixed right)
         ========================================= */}
      <div
        className='hidden md:block fixed md:max-lg:right-6 right-4 lg:right-10 md:max-lg:top-44 top-28 lg:top-1/2 lg:-translate-y-1/2 z-30 pointer-events-none md:max-lg:w-[300px] lg:w-[460px]'
        style={{
          height: stackHeight,
        }}
      >
        <div className='relative w-full h-full'>
          {navCategories.map((category, index) => {
            const rotation = getCategoryRotation(category.id)
            const offset = getCategoryOffset(category.id, index)
            const isAllCategories = category.id === '__all__'
            const isActive = isAllCategories
              ? selectedCategory === null
              : selectedCategory === category.id
            const isHovered = hoveredCategory === category.id
            const showBrush = isActive || isHovered

            return (
              <button
                key={category.id}
                onClick={() =>
                  onSelectCategory(
                    isAllCategories ? null : isActive ? null : category.id,
                  )
                }
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className='absolute right-0 cursor-pointer focus:outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-black/40'
                style={{
                  transformOrigin: 'right center',
                  transform: `translate(${offset.x}px, ${TOP_PAD + offset.y}px) rotate(${rotation}deg)`,
                }}
                aria-pressed={isActive}
                type='button'
              >
                <div className='relative inline-block'>
                  {/* Brush underneath */}
                  {showBrush && (
                    <div
                      className='absolute inset-x-0 bottom-0 flex items-end justify-center z-0 pointer-events-none'
                      style={{ height: '110%' }}
                    >
                      <RealBrush
                        seed={`category:${category.id}`}
                        color={BRUSH_COLOR}
                        className='absolute -inset-x-2 bottom-0'
                        style={{ height: BRUSH_H_PX }}
                      />
                    </div>
                  )}

                  {/* Image/title above */}
                  <div className='relative z-10'>
                    {category.titleImageUrl ? (
                      <Image
                        src={category.titleImageUrl}
                        alt={category.title}
                        width={400}
                        height={100}
                        className='object-contain h-auto w-auto'
                        style={{ maxHeight: IMG_MAX_H_PX }}
                        priority={index < 3}
                        sizes='400px'
                      />
                    ) : (
                      <span className='text-xl lg:text-2xl font-right-grotesk-narrow-medium'>
                        {category.title}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile slide-out category nav (contact-style) */}
      <motion.div
        className='lg:hidden md:hidden fixed bottom-4 right-4 z-40 flex items-end pointer-events-none'
        initial={{ x: mobileHideOffset }}
        animate={{ x: isMobileMenuOpen ? 0 : mobileHideOffset }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      >
        <MobileBlurBackdrop
          show={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div
          ref={mobileContentRef}
          className='flex items-end pointer-events-none'
        >
          <button
            ref={mobileHandleRef}
            type='button'
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className='flex flex-shrink-0 -mr-1 pt-2 pl-2 relative cursor-pointer pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
            aria-expanded={isMobileMenuOpen}
            aria-label='Toggle category navigation'
          >
            <div className='relative flex items-center gap-2'>
              <RealBrush
                seed='category:mobile-handle'
                color={BRUSH_COLOR}
                className='absolute -inset-x-3 -z-10'
                style={{
                  height: 34,
                  top: '52%',
                  transform: 'translateY(-50%)',
                }}
              />
              <Image
                src='/images/ByCategory.png'
                alt='By Category'
                width={400}
                height={400}
                className='object-contain h-8 w-auto select-none pointer-events-none'
              />
            </div>
            <span className='relative ml-1 h-2 mt-3 w-10 pointer-events-none'>
              <Image
                src='/images/brushMenuHorizontal.png'
                alt=''
                fill
                className='object-fill -rotate-8'
              />
            </span>
          </button>

          <ul className='space-y-0 relative ml-2 min-w-[200px]'>
            <div className='absolute left-0 top-0 h-full w-[18px] pointer-events-none'>
              <Image
                src='/images/brushMenu.png'
                alt=''
                fill
                className='object-fill object-top'
              />
            </div>
            {navCategories.map((category) => {
              const isAllCategories = category.id === '__all__'
              const isActive = isAllCategories
                ? selectedCategory === null
                : selectedCategory === category.id
              return (
                <li key={category.id}>
                  <button
                    type='button'
                    onClick={() => {
                      onSelectCategory(
                        isAllCategories ? null : isActive ? null : category.id,
                      )
                      setIsMobileMenuOpen(false)
                    }}
                    aria-pressed={isActive}
                    className='relative block w-full text-left pl-6 pr-2 py-0.5 -mt-1.5 whitespace-nowrap cursor-pointer pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
                  >
                    <span className='relative z-10 inline-flex items-center'>
                      {isActive && (
                        <span className='absolute left-1/2 bottom-0 -z-10 flex w-[calc(100%+14px)] -translate-x-1/2 translate-y-[4%] items-end justify-center pointer-events-none'>
                          <RealBrush
                            seed={`category:${category.id}:mobile`}
                            color={BRUSH_COLOR}
                            className='w-full'
                            style={{ height: MOBILE_BRUSH_H_PX }}
                          />
                        </span>
                      )}
                      {category.titleImageUrl ? (
                        <Image
                          src={category.titleImageUrl}
                          alt={category.title}
                          width={220}
                          height={56}
                          className='object-contain h-[32px] w-auto'
                        />
                      ) : (
                        <span className='text-[15px] font-right-grotesk-narrow-medium leading-none'>
                          {category.title}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </motion.div>
    </>
  )
}

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

function MobileBlurBackdrop({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  const mounted = useMounted()
  if (!mounted) return null

  return ReactDOM.createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          key='project-category-mobile-backdrop'
          className='fixed inset-0 z-30'
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          style={{
            background: 'rgba(255,255,255,0.30)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
