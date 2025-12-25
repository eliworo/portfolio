'use client'

import { useState } from 'react'
import Image from 'next/image'

type Tool = {
  titleImage?: {
    asset?: { url?: string | null } | null
  } | null
  subtitle?: string | null
  description?: string | null
  image?: {
    asset?: { url?: string | null } | null
    alt?: string | null
  } | null
  offsetY?: number | null
  offsetX?: number | null
  rotation?: number | null
  scale?: number | null
}

export default function ToolCard({ tool }: { tool: Tool }) {
  const [isHovered, setIsHovered] = useState(false)

  const tx = tool.offsetX ?? 0
  const ty = tool.offsetY ?? 0
  const rot = tool.rotation ?? 0
  const s = tool.scale ?? 1

  return (
    <div
      style={
        {
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rot': `${rot}deg`,
          '--s': String(s),
        } as React.CSSProperties
      }
      className='
        transition-transform duration-300 ease-out
        lg:[transform:translate(var(--tx),var(--ty))_rotate(var(--rot))_scale(var(--s))]
      '
    >
      {/* Image */}
      {tool.image?.asset?.url && (
        <div
          className='relative aspect-video rounded-lg cursor-pointer'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={tool.image.asset.url}
            alt={tool.image.alt || tool.subtitle || ''}
            fill
            className='object-cover border-4'
          />

          {/* Inner white haze frame */}
          <div className='absolute inset-0 shadow-[inset_0_0_8px_12px_white] pointer-events-none' />
        </div>
      )}

      {/* Title image (the handwritten TOOL label image) */}
      {tool.titleImage?.asset?.url && (
        <div className='-ml-2 -mt-24 mb-14 -rotate-2'>
          <Image
            src={tool.titleImage.asset.url}
            alt={tool.subtitle || ''}
            width={320}
            height={120}
            className='w-full h-auto object-contain object-left max-h-16'
          />
        </div>
      )}

      {/* Subtitle */}
      {tool.subtitle && (
        <h3 className='text-2xl uppercase font-rader-bold mt-8'>
          {tool.subtitle}
        </h3>
      )}

      {/* Description */}
      {tool.description && (
        <p className='text-black text-lg leading-tight drop-shadow-xs mt-4'>
          {tool.description}
        </p>
      )}
    </div>
  )
}
