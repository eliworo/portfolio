'use client'

import { useState } from 'react'
import Image from 'next/image'

type Tool = {
  titleImage?: {
    asset?: {
      url?: string | null
    } | null
  } | null
  subtitle?: string | null
  description?: string | null
  image?: {
    asset?: {
      url?: string | null
    } | null
    alt?: string | null
  } | null
  offsetY?: number | null
  offsetX?: number | null
  rotation?: number | null
  scale?: number | null
}

export default function ToolCard({ tool }: { tool: Tool }) {
  const [isHovered, setIsHovered] = useState(false)

  const transformStyle = {
    transform: `translate(${tool.offsetX || 0}px, ${tool.offsetY || 0}px) 
                rotate(${tool.rotation || 0}deg) 
                scale(${tool.scale || 1})`,
    transition: 'transform 0.3s ease',
  }

  return (
    <div className='space-y-4' style={transformStyle}>
      {/* Tool Title Image */}
      {tool.titleImage?.asset?.url && (
        <div className='-ml-4 -mb-0.5 -rotate-2'>
          <Image
            src={tool.titleImage.asset.url}
            alt={tool.subtitle || ''}
            width={300}
            height={100}
            className='w-full h-auto object-contain object-left max-h-16'
          />
        </div>
      )}

      {/* Subtitle */}
      {tool.subtitle && <h3 className='text-3xl uppercase'>{tool.subtitle}</h3>}

      {/* Image with Description Overlay */}
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
            className={`object-cover transition-all duration-150 ${
              isHovered ? 'blur-none' : 'blur-md'
            }`}
          />

          {/* Description Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-150 ${
              isHovered ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <p className='text-white text-sm leading-tight drop-shadow-lg h-full'>
              {tool.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
