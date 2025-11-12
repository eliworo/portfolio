'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type FeaturedProject = {
  project?: {
    _id: string
    title?: string
    slug?: {
      current?: string
    }
    coverImage?: {
      asset?: {
        url?: string
      }
      alt?: string
    }
    projectType?: {
      slug?: {
        current?: string
      }
    }
  } | null
  offsetY?: number | null
  offsetX?: number | null
  rotation?: number | null
  scale?: number | null
  zIndex?: number | null
}

export default function FeaturedProjectCard({
  item,
}: {
  item: FeaturedProject
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (!item.project) return null

  const href =
    item.project.projectType?.slug?.current && item.project.slug?.current
      ? `/${item.project.projectType.slug.current}/p/${item.project.slug.current}`
      : '#'

  const transformStyle = {
    transform: `translate(${item.offsetX || 0}px, ${item.offsetY || 0}px) 
                rotate(${item.rotation || 0}deg) 
                scale(${isHovered ? (item.scale || 1) * 1.01 : item.scale || 1})`,
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }

  return (
    <div className='relative' style={{ zIndex: item.zIndex || 0 }}>
      <Link
        href={href}
        className='block break-inside-avoid mb-4'
        style={transformStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.project.coverImage?.asset?.url && (
          <Image
            src={item.project.coverImage.asset.url}
            alt={item.project.coverImage.alt || item.project.title || ''}
            width={400}
            height={600}
            className='w-full h-auto object-cover transition-shadow duration-150'
          />
        )}
      </Link>
    </div>
  )
}
