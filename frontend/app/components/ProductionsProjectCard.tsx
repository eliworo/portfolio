'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CoverImage from './CoverImage'
import PaintBrush from './drawings/PaintBrush'

type ProductionsProjectCardProps = {
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

const getPositionClasses = (position?: string | null) => {
  // Clean the position string by removing non-word characters except hyphens
  const cleanPosition = position?.replace(/[^\w-]/g, '')

  switch (cleanPosition) {
    case 'top-left':
      return 'top-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'middle-left':
      return 'top-1/2 -translate-y-1/2 -left-8 lg:-left-1/4'
    case 'middle-right':
      return 'top-1/2 -translate-y-1/2 -right-8lg:-right-1/4'
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
}: ProductionsProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (!item.project || !item.project.slug?.current) {
    return null
  }

  const positionClasses = getPositionClasses(item.titlePosition)
  const href = `/productions/${item.project.slug.current}`

  return (
    <div
      className='relative mb-2 break-inside-avoid overflow-visible px-12 lg:px-0'
      style={{
        zIndex: item.zIndex || 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          x: item.offsetX ?? 0,
          y: item.offsetY ?? 0,
          rotate: item.rotation ?? 0,
          scale: item.scale ?? 1,
        }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className='cursor-pointer'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={href} className='block'>
          <div className='relative overflow-visible w-auto h-auto aspect-video'>
            <CoverImage image={item.project.coverImage} />
            {/* <Image
              src={item.project.coverImage.asset.url}
              alt={item.project.coverImage.alt || item.project.title}
              fill
              className='object-contain h-auto w-full'
            /> */}

            {/* Title Image Overlay */}
            {item.project.titleImage?.asset?.url && (
              <div className={`absolute ${positionClasses} z-10`}>
                <Image
                  src={item.project.titleImage.asset.url}
                  alt={item.project.title || 'Project'}
                  width={500}
                  height={500}
                  className='object-contain h-12 lg:h-28 w-auto'
                />
                <PaintBrush
                  className='absolute top-1/2 -translate-y-[45%] -rotate-1 w-[110%] h-[80%] -z-10'
                  theme={{ fill: '#eee' }}
                />
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
