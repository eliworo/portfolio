'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import CoverImage from './CoverImage'
import RealBrush from './drawings/RealBrush'
import PaintedTitleImage from './PaintedTitleImage'

type ProductionsProjectCardProps = {
  priority?: boolean
  item: {
    project: {
      _id: string
      title: string | null
      slug: {
        current: string | null
      } | null
      titleImage?: {
        asset?: {
          url?: string | null
        } | null
      } | null
      coverImage: {
        asset?: {
          _ref: string
          _type: 'reference'
        }
        alt?: string | null
      } | null
      projectKind?: string | null
      brushColor?: string | null
      categories?: Array<{
        _id: string
        title: string | null
        slug: {
          current: string | null
        } | null
        titleImage?: {
          asset?: {
            url?: string | null
          } | null
        } | null
      }> | null
    } | null
    titlePosition?: string | null
    offsetY?: number | null
    offsetX?: number | null
    rotation?: number | null
    scale?: number | null
    zIndex?: number | null
  }
}

type ProductionProject = NonNullable<
  ProductionsProjectCardProps['item']['project']
>

const brushColors = [
  '#FFB6C1',
  '#98D8C8',
  '#F7DC6F',
  '#BEBBDA',
  '#F8B88B',
  '#347980',
  '#ccc',
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function getProjectBrushColor(project: ProductionProject | null) {
  if (!project) return brushColors[0]

  const customColor = project.brushColor?.trim()
  if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
    return customColor
  }

  return brushColors[hashString(project._id) % brushColors.length]
}

const getPositionClasses = (position?: string | null) => {
  // Clean the position string by removing non-word characters except hyphens
  const cleanPosition = position?.replace(/[^\w-]/g, '')

  switch (cleanPosition) {
    case 'top-left':
      return 'top-4 -left-8 lg:-left-1/4'
    case 'top-right':
      return 'top-4 -right-8 lg:-right-1/4'
    case 'middle-left':
      return 'top-1/2 -translate-y-1/2 -left-8 lg:-left-1/4'
    case 'middle-right':
      return 'top-1/2 -translate-y-1/2 -right-8 lg:-right-1/4'
    case 'bottom-left':
      return 'bottom-4 -left-8 lg:-left-1/4'
    case 'bottom-right':
      return 'bottom-4 -right-8 lg:-right-1/4'
    default:
      return 'top-4 left-4'
  }
}

export default function ProductionsProjectCard({
  item,
  priority = false,
}: ProductionsProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hasDesktopOffsets, setHasDesktopOffsets] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)')
    const syncDesktopOffsets = () => setHasDesktopOffsets(mediaQuery.matches)

    syncDesktopOffsets()
    mediaQuery.addEventListener('change', syncDesktopOffsets)

    return () => mediaQuery.removeEventListener('change', syncDesktopOffsets)
  }, [])

  // Move hooks BEFORE the early return
  // Use project ID to get consistent color and rotation
  const brushColor = useMemo(() => {
    return getProjectBrushColor(item.project)
  }, [item.project])

  // Generate subtle random rotation (-3 to +3 degrees)
  const brushRotation = useMemo(() => {
    if (!item.project) return 0
    const hash = hashString(item.project._id + 'rotation')
    return (hash % 7) - 3 // Range: -3 to +3
  }, [item.project])

  // NOW the early return
  if (!item.project || !item.project.slug?.current) {
    return null
  }

  const positionClasses = getPositionClasses(item.titlePosition)
  const href = `/productions/${item.project.slug.current}`
  const animatedX = hasDesktopOffsets ? (item.offsetX ?? 0) : 0
  const animatedY = hasDesktopOffsets ? (item.offsetY ?? 0) : 0
  const animatedRotation = hasDesktopOffsets ? (item.rotation ?? 0) : 0
  const animatedScale = hasDesktopOffsets ? (item.scale ?? 1) : 1

  return (
    <div
      className='relative mb-2 break-inside-avoid overflow-visible px-12 lg:px-0'
      style={{
        zIndex: item.zIndex || 0,
      }}
    >
      <motion.div
        initial={false}
        animate={{
          x: animatedX,
          y: animatedY,
          rotate: animatedRotation,
          scale: animatedScale,
        }}
        transition={{ duration: 0.25 }}
        className='cursor-pointer'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={href} className='block'>
          <div className='relative overflow-visible w-auto h-auto aspect-video'>
            <CoverImage image={item.project.coverImage} priority={priority} revealEffect='blur' />

            {/* Title Image Overlay */}
            {item.project.titleImage?.asset?.url && (
              <div
                className={`absolute ${positionClasses} z-10`}
              >
                <div
                  className='relative'
                  style={{
                    rotate: `${brushRotation}deg`,
                  }}
                >
                  <RealBrush
                    seed={`category:${item.project._id}`}
                    color={brushColor}
                    className='absolute -inset-x-2 bottom-0 h-14 inset-y-1 -z-10'
                  />
                  <div className='py-2'>
                    <PaintedTitleImage
                      src={item.project.titleImage.asset.url}
                      alt={item.project.title || 'Project'}
                      width={500}
                      height={500}
                      sizes='(min-width: 1024px) 320px, 220px'
                      priority={priority}
                      className='object-contain h-12 w-auto'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
