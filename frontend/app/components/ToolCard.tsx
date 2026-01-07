'use client'

import { useState } from 'react'
import Image from 'next/image'
import BrushTitle from '@/app/components/BrushTitle'

type Tool = {
  titleImage?: { asset?: { url?: string | null } | null } | null
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
        xl:[transform:translate(var(--tx),var(--ty))_rotate(var(--rot))_scale(var(--s))]
      '
    >
      {/* Image */}
      {tool.image?.asset?.url && (
        <div
          className='relative aspect-video rounded-lg'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={tool.image.asset.url}
            alt={tool.image.alt || tool.subtitle || ''}
            fill
            className='object-cover'
          />
          <div className='absolute inset-0 shadow-[inset_0_0_8px_12px_white] pointer-events-none' />
        </div>
      )}

      {/* Subtitle with brush background */}
      {tool.subtitle && (
        <BrushTitle
          as='h3'
          seed={`tool-subtitle:${tool.subtitle}`} // deterministic per tool
          color='#98D8C8'
          className='mt-8 font-right-grotesk-narrow-medium text-lg xl:text-2xl text-black px-4'
          brushClassName='absolute -inset-x-2 -inset-y-2 -z-10 opacity-90'
          brushStyle={{
            height: '1.15em',
            top: '70%',
            transform: 'translateY(-52%)',
          }}
          rotate={false}
        >
          <span className=''>{tool.subtitle}</span>
        </BrushTitle>
      )}

      {/* Description */}
      {tool.description && (
        <p className='text-black text-base xl:text-lg leading-snug drop-shadow-xs mt-4 px-4'>
          {tool.description}
        </p>
      )}
    </div>
  )
}
