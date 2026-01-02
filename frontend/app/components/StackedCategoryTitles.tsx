'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import RealBrush from './drawings/RealBrush'

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
const BRUSH_COLOR = '#9AB1FF'

/**
 * Single knob for sizing.
 * 1 = current; 0.85 = 15% smaller; tweak as needed.
 */
const SCALE = 1

// Derived “rhythm” numbers so spacing stays proportional
const ITEM_GAP = Math.round(65 * SCALE)
const TOP_PAD = Math.round(20 * SCALE)
const BOTTOM_PAD = Math.round(20 * SCALE)
const BRUSH_H_PX = Math.round(56 * SCALE) // h-14 is ~56px
const IMG_MAX_H_PX = Math.round(55 * SCALE) // old lg max-h ~55px (close enough)

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
}: StackedCategoryTitlesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

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

  // Give the stack a real height so the panel isn’t 0px tall
  const stackHeight = useMemo(() => {
    return TOP_PAD + categories.length * ITEM_GAP + BOTTOM_PAD
  }, [categories.length])

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

  return (
    <>
      {/* =========================================
          Group Title (supports stacked + horizontal)
         ========================================= */}
      {!hideGroupTitle && (
        <div className='px-4 lg:px-0 lg:mb-8 absolute -rotate-3 lg:rotate-0 left-1/2 -translate-x-1/2 lg:left-22 top-30 lg:top-16 z-20 w-[85vw] lg:w-[40vw] lg:translate-x-0 pointer-events-none'>
          <div className='mb-8 lg:mb-12'>
            {effectiveVariant === 'stacked' ? (
              <div
                className='relative'
                style={{
                  width: 'min(680px, 85vw)',
                  height: 'clamp(180px, 18vw, 260px)',
                }}
              >
                {/* STUDIO */}
                <div className='absolute left-0 top-0 origin-left rotate-[0deg]'>
                  <Image
                    src={images.studio!}
                    alt={groupTitle ? `${groupTitle} — Studio` : 'Studio'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{
                      maxHeight: Math.round(140 * SCALE),
                    }}
                    priority
                    sizes='(max-width: 1024px) 85vw, 680px'
                  />
                </div>

                {/* WORKS */}
                <div className='absolute left-[20%] top-[52%] origin-left rotate-[2deg]'>
                  <Image
                    src={images.works!}
                    alt={groupTitle ? `${groupTitle} — Works` : 'Works'}
                    width={900}
                    height={260}
                    className='object-contain h-auto w-auto'
                    style={{
                      maxHeight: Math.round(140 * SCALE),
                    }}
                    priority
                    sizes='(max-width: 1024px) 85vw, 680px'
                  />
                </div>
              </div>
            ) : images.horizontal ? (
              <Image
                src={images.horizontal}
                alt={groupTitle || 'Studio Works'}
                width={800}
                height={200}
                className='object-contain h-auto w-auto'
                style={{
                  maxHeight: Math.round(120 * SCALE),
                }}
                priority
                sizes='(max-width: 1024px) 80vw, 600px'
              />
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================
          Stacked Category Titles (fixed right)
         ========================================= */}
      <div
        className='fixed right-4 lg:right-10 top-28 lg:top-1/2 lg:-translate-y-1/2 z-30 pointer-events-none'
        style={{
          width: 460,
          height: stackHeight,
        }}
      >
        <div className='relative w-full h-full'>
          {categories.map((category, index) => {
            const rotation = getCategoryRotation(category.id)
            const offset = getCategoryOffset(category.id, index)
            const isActive = selectedCategory === category.id
            const isHovered = hoveredCategory === category.id
            const showBrush = isActive || isHovered

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(isActive ? null : category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className='absolute right-0 cursor-pointer focus:outline-none pointer-events-auto'
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
                        className='absolute -inset-x-4 bottom-0'
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
                      <span className='text-xl lg:text-2xl font-rader-bold'>
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
    </>
  )
}
