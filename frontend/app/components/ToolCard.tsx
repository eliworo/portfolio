'use client'

import Image from 'next/image'
import {
  PortableText,
  type PortableTextReactComponents,
} from '@portabletext/react'
import BrushTitle from '@/app/components/BrushTitle'

type Tool = {
  title?: string | null
  description?: any[] | string | null
  image?: {
    asset?: { url?: string | null } | null
    alt?: string | null
  } | null
  offsetY?: number | null
  offsetX?: number | null
}

export default function ToolCard({ tool }: { tool: Tool }) {
  const tx = tool.offsetX ?? 0
  const ty = tool.offsetY ?? 0
  const portableComponents: Partial<PortableTextReactComponents> = {
    block: {
      normal: ({ children }) => (
        <p className='mb-4 last:mb-0 text-black text-base xl:text-lg leading-snug whitespace-pre-line'>
          {children}
        </p>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className='font-semibold'>{children}</strong>
      ),
    },
  }

  return (
    <div className='xl:[--tx:0px] xl:[--ty:0px]'>
      <div
        style={
          {
            '--tx': `${tx}px`,
            '--ty': `${ty}px`,
          } as React.CSSProperties
        }
        className='transition-transform duration-300 ease-out xl:[transform:translate(var(--tx),var(--ty))]'
      >
        {/* Image */}
        {tool.image?.asset?.url && (
          <div className='relative aspect-video rounded-lg'>
            <Image
              src={tool.image.asset.url}
              alt={tool.image.alt || tool.title || ''}
              fill
              className='object-cover'
            />
            <div className='absolute inset-0 shadow-[inset_0_0_8px_12px_white] pointer-events-none' />
          </div>
        )}

        {/* Title with brush background */}
        {tool.title && (
          <BrushTitle
            as='h3'
            seed={`tool-title:${tool.title}`} // deterministic per tool
            color='#D9D9D9'
            className='mt-2 font-right-grotesk-narrow-medium text-xl xl:text-3xl text-black px-4'
            brushClassName='absolute -inset-x-2 -inset-y-2 -z-10 opacity-90'
            brushStyle={{
              height: '1.15em',
              top: '70%',
              transform: 'translateY(-52%)',
            }}
            rotate={false}
          >
            <span>{tool.title}</span>
          </BrushTitle>
        )}

        {/* Description */}
        {tool.description && (
          <div className='drop-shadow-xs mt-2 xl:mt-4 px-4'>
            {typeof tool.description === 'string' ? (
              <p className='text-black text-base xl:text-lg leading-snug whitespace-pre-line'>
                {tool.description}
              </p>
            ) : (
              <PortableText
                value={tool.description}
                components={portableComponents}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
