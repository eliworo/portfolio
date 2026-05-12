'use client'

import ReactDOM from 'react-dom'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import RealBrush from './drawings/RealBrush'
import VerticalLine from './lines/VerticalLine'
import { useOptimizedImagePreload } from './useOptimizedImagePreload'
import PaintedTitleImage from './PaintedTitleImage'
import BlendArrow, { type BlendRect } from './BlendArrow'

/** =========================================
 * Types
 * ========================================= */

export interface CategoryItem {
  id: string
  title: string
  titleImageUrl?: string
}

type StackNavItem = CategoryItem & {
  brushColor?: string
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
  projectTitle?: {
    title: string
    titleImageUrl?: string
    brushColor?: string
  }
  showProjectTitle?: boolean
  showMobileCategoryNav?: boolean
  showScrollTopButton?: boolean
  onSelectProjectTitle?: () => void
  onScrollToTop?: () => void
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
  projectTitle,
  showProjectTitle = false,
  showMobileCategoryNav = true,
  showScrollTopButton = false,
  onSelectProjectTitle,
  onScrollToTop,
  hideGroupTitle,
  showAllCategories = true,
}: StackedCategoryTitlesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const mobileHandleRef = useRef<HTMLButtonElement>(null)
  const scrollTopArrowRef = useRef<HTMLButtonElement>(null)
  const [mobileContentWidth, setMobileContentWidth] = useState(0)
  const [mobileHandleWidth, setMobileHandleWidth] = useState(0)
  const [mobileMeasured, setMobileMeasured] = useState(false)
  const [scrollTopArrowBlend, setScrollTopArrowBlend] =
    useState<ArrowBlendState>(EMPTY_ARROW_BLEND)

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

  const navCategories = useMemo<CategoryItem[]>(() => {
    if (!showAllCategories) return categories

    return [
      {
        id: '__all__',
        title: 'All categories',
        titleImageUrl: '/images/optimized/AllCategoriesLogo-800.webp',
      },
      ...categories,
    ]
  }, [categories, showAllCategories])

  const activeMobileCategory = useMemo(
    () =>
      selectedCategory
        ? navCategories.find((category) => category.id === selectedCategory)
        : undefined,
    [navCategories, selectedCategory],
  )

  const projectTitleNavItem = useMemo<StackNavItem | null>(() => {
    if (!projectTitle) return null

    return {
      id: '__project_title__',
      title: projectTitle.title,
      titleImageUrl: projectTitle.titleImageUrl,
      brushColor: projectTitle.brushColor,
    }
  }, [projectTitle])

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
  const preloadImages = useMemo(
    () => [
      { src: images.horizontal, width: 800, quality: 70 },
      { src: images.studio, width: 900, quality: 70 },
      { src: images.works, width: 900, quality: 70 },
      {
        src: projectTitleNavItem?.titleImageUrl,
        width: 800,
        quality: 70,
      },
      ...navCategories.map((category) => ({
        src: category.titleImageUrl,
        width: 800,
        quality: 70,
      })),
    ],
    [images, navCategories, projectTitleNavItem],
  )

  useOptimizedImagePreload(preloadImages, {
    width: 800,
    quality: 70,
    concurrency: 3,
    eager: true,
  })

  useEffect(() => {
    if (!showMobileCategoryNav) {
      setIsMobileMenuOpen(false)
    }
  }, [showMobileCategoryNav])

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

  useEffect(() => {
    if (!showScrollTopButton) {
      setScrollTopArrowBlend(EMPTY_ARROW_BLEND)
      return
    }

    let rafId: number | null = null

    const measureScrollTopArrowBlend = (): ArrowBlendState => {
      const arrow = scrollTopArrowRef.current
      if (!arrow) return EMPTY_ARROW_BLEND

      const arrowRect = arrow.getBoundingClientRect()
      const selectors = [
        'main img',
        'main video',
        'main canvas',
        'main p',
        'main h1',
        'main h2',
        'main h3',
        'main h4',
        'main h5',
        'main h6',
        'main a',
        'main li',
        'main figcaption',
      ].join(',')
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(selectors))
      const rects = candidates.flatMap((element) => {
        if (arrow.contains(element) || element.contains(arrow)) return []

        const elementRect = element.getBoundingClientRect()
        const x = Math.max(arrowRect.left, elementRect.left)
        const y = Math.max(arrowRect.top, elementRect.top)
        const right = Math.min(arrowRect.right, elementRect.right)
        const bottom = Math.min(arrowRect.bottom, elementRect.bottom)
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

    const update = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        rafId = null
        const nextBlend = measureScrollTopArrowBlend()
        setScrollTopArrowBlend((prev) =>
          equalArrowBlendState(prev, nextBlend) ? prev : nextBlend,
        )
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [showScrollTopButton])

  return (
    <>
      {/* =========================================
          Group Title (supports stacked + horizontal)
         ========================================= */}
      {!hideGroupTitle && (
        <div
          className='
    px-4 lg:px-0
    relative lg:absolute
    mt-32 ml-12 sm:mt-20 lg:mt-0
    -rotate-3 lg:rotate-0
    left-auto lg:left-22
    top-auto lg:top-16
    w-[85vw] lg:w-[40vw]
    mx-auto lg:mx-0
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
                  <PaintedTitleImage
                    src={images.studio!}
                    alt={groupTitle ? `${groupTitle} — Studio` : 'Studio'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{ maxHeight: Math.round(140 * SCALE) }}
                    priority
                    sizes='(max-width: 1023px) 85vw, 680px'
                  />
                </button>

                {/* WORKS — clickable only on the WORKS image area */}
                <button
                  type='button'
                  onClick={() => onSelectCategory(null)}
                  className='absolute left-[18.5%] top-[52%] origin-left rotate-[2deg] pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
                  aria-label='Reset category filter (Works)'
                >
                  <PaintedTitleImage
                    src={images.works!}
                    alt={groupTitle ? `${groupTitle} — Works` : 'Works'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{ maxHeight: Math.round(140 * SCALE) }}
                    priority
                    sizes='(max-width: 1023px) 85vw, 680px'
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
                <PaintedTitleImage
                  src={images.horizontal}
                  alt={groupTitle || 'Studio Works'}
                  width={800}
                  height={200}
                  className='object-contain h-auto w-auto'
                  style={{ maxHeight: Math.round(120 * SCALE) }}
                  priority
                  sizes='(max-width: 1023px) 85vw, 600px'
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
        className='hidden min-[1180px]:block fixed right-10 top-1/2 -translate-y-1/2 z-30 pointer-events-none w-[460px]'
        style={{
          height: stackHeight,
        }}
      >
        <div className='relative w-full h-full'>
          <AnimatePresence>
            {showProjectTitle && projectTitleNavItem ? (
              <motion.button
                key='project-title-nav-item'
                type='button'
                onClick={() => onSelectProjectTitle?.()}
                onMouseEnter={() => setHoveredCategory(projectTitleNavItem.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className='absolute right-0 z-20 cursor-pointer focus:outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-black/40'
                style={{
                  transformOrigin: 'right center',
                  top: -ITEM_GAP,
                  transform: 'rotate(-1.5deg)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                aria-label='Back to top'
              >
                <div className='relative inline-block'>
                  <div
                    className='absolute inset-x-0 bottom-0 flex items-end justify-center z-0 pointer-events-none'
                    style={{ height: '110%' }}
                  >
                    <RealBrush
                      seed='category:project-title'
                      color={projectTitleNavItem.brushColor || BRUSH_COLOR}
                      className='absolute -inset-x-2 bottom-0'
                      style={{ height: BRUSH_H_PX }}
                    />
                  </div>
                  <div className='relative z-10'>
                    {projectTitleNavItem.titleImageUrl ? (
                      <PaintedTitleImage
                        src={projectTitleNavItem.titleImageUrl}
                        alt={projectTitleNavItem.title}
                        width={400}
                        height={100}
                        className='object-contain h-auto w-auto'
                        style={{ maxHeight: IMG_MAX_H_PX }}
                        priority
                        sizes='400px'
                      />
                    ) : (
                      <span className='text-xl lg:text-2xl font-right-grotesk-narrow-medium'>
                        {projectTitleNavItem.title}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ) : null}
          </AnimatePresence>

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
                      <PaintedTitleImage
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
        className='min-[1180px]:hidden fixed right-4 top-28 z-40 flex items-start pointer-events-none'
        initial={{ x: mobileHideOffset, opacity: 0 }}
        animate={{
          x: showMobileCategoryNav
            ? isMobileMenuOpen
              ? 0
              : mobileHideOffset
            : mobileHideOffset,
          opacity: showMobileCategoryNav ? 1 : 0,
        }}
        transition={{
          x: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
          opacity: { duration: 0.22, ease: 'easeOut' },
        }}
        aria-hidden={!showMobileCategoryNav}
      >
        <MobileBlurBackdrop
          show={isMobileMenuOpen && showMobileCategoryNav}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        <div
          ref={mobileContentRef}
          className='flex items-start pointer-events-none'
        >
          <button
            ref={mobileHandleRef}
            type='button'
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`flex flex-shrink-0 -mr-1 pt-2 pl-2 relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
              showMobileCategoryNav
                ? 'pointer-events-auto'
                : 'pointer-events-none'
            }`}
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
              {activeMobileCategory?.titleImageUrl ? (
                <PaintedTitleImage
                  src={activeMobileCategory.titleImageUrl}
                  alt={activeMobileCategory.title}
                  width={600}
                  height={148}
                  sizes='220px'
                  className='object-contain h-8 w-auto select-none pointer-events-none'
                />
              ) : activeMobileCategory ? (
                <span className='relative z-10 text-[28px] leading-none font-right-grotesk-narrow-medium select-none pointer-events-none'>
                  {activeMobileCategory.title}
                </span>
              ) : (
                <PaintedTitleImage
                  src='/images/optimized/ByCategory-600.webp'
                  alt='By Category'
                  width={600}
                  height={148}
                  className='object-contain h-8 w-auto select-none pointer-events-none'
                />
              )}
            </div>
            <span className='relative ml-1 h-2 mt-3 w-10 pointer-events-none'>
              <Image
                src='/images/optimized/brushMenuHorizontal-420.webp'
                alt=''
                fill
                className='object-fill -rotate-8'
              />
            </span>
          </button>

          <ul className='space-y-0 relative ml-2 min-w-[200px]'>
            <div className='absolute left-0 top-0 h-full w-[18px] pointer-events-none'>
              <Image
                src='/images/optimized/brushMenu-160.webp'
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
                        <PaintedTitleImage
                          src={category.titleImageUrl}
                          alt={category.title}
                          width={220}
                          height={56}
                          sizes='220px'
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

      <AnimatePresence>
        {showScrollTopButton ? (
          <motion.button
            ref={scrollTopArrowRef}
            type='button'
            className='min-[1180px]:hidden fixed bottom-24 right-5 z-40 cursor-pointer pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
            onClick={() => onScrollToTop?.()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label='Back to top'
          >
            <BlendArrow
              direction='up'
              bounds={scrollTopArrowBlend}
              blendRects={scrollTopArrowBlend.rects}
              className='h-12 w-12'
            />
          </motion.button>
        ) : null}
      </AnimatePresence>
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
