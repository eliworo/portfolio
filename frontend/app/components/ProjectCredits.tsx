'use client'

import { PortableText, PortableTextComponents } from '@portabletext/react'
import Link from 'next/link'
import { PortableTextBlock } from 'sanity'
import RealBrush from './drawings/RealBrush' // adjust path to where RealBrush lives

interface ProjectCreditsProps {
  credits?: PortableTextBlock[] | null
  press?: PortableTextBlock[] | null
  tournee?: PortableTextBlock[] | null
}

// Hand-drawn arrow for external links
function HandArrowIcon() {
  return (
    <svg
      className='inline-block w-3.5 h-3.5 ml-0.5 -translate-y-px opacity-70'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M3 13C4 12 7 9 11 5M11 5V10M11 5H6'
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className='mb-8 last:mb-0 whitespace-pre-wrap'>{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className='text-2xl font-bold mb-4 whitespace-pre-wrap'>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className='text-lg font-semibold mb-4 whitespace-pre-wrap'>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className='text-lg font-semibold whitespace-pre-wrap'>{children}</h4>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className='font-rader-bold'>{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span className='underline'>{children}</span>,
    link: ({ value, children }) => {
      const isInternal = value?.linkType === 'internal'
      const href = isInternal ? value?.internalLink : value?.href
      const openInNewTab = value?.openInNewTab

      if (!href) return <span>{children}</span>

      const baseClasses =
        'text-black no-underline border-b border-black border-dashed hover:opacity-70 transition-opacity'

      if (isInternal) {
        return (
          <Link href={href} className={baseClasses}>
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          className={baseClasses}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {children}
          {openInNewTab && <HandArrowIcon />}
        </a>
      )
    },
  },
  list: {
    bullet: ({ children }) => <ul className='list-disc ml-6'>{children}</ul>,
    number: ({ children }) => <ol className='list-decimal ml-6'>{children}</ol>,
  },
}

const tourneeComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => {
      const hasComplexChildren =
        Array.isArray(children) &&
        children.some((child) => typeof child === 'object' && child !== null)

      if (hasComplexChildren) {
        return (
          <p className='mb-5 last:mb-0 whitespace-pre-wrap leading-relaxed text-base lg:text-lg'>
            {children}
          </p>
        )
      }

      const text = String(children)

      const match = text.match(
        /^([\d\-\s]+(?:to[\d\-\s]+)?)\s+(.+?)\s+\(([A-Z]{2,})\)$/i
      )

      if (match) {
        const [, dates, venue, country] = match
        return (
          <p className='mb-5 last:mb-0 whitespace-pre-wrap leading-relaxed'>
            <span className='font-rader-bold text-base lg:text-lg'>
              {dates}
            </span>
            <span className='ml-3'>{venue}</span>
            <span className='ml-2 font-agrandir-italic'>({country})</span>
          </p>
        )
      }

      return (
        <p className='mb-5 last:mb-0 whitespace-pre-wrap text-base lg:text-lg'>
          {children}
        </p>
      )
    },
  },
  marks: {
    ...components.marks,
    strong: ({ children }) => (
      <span className='font-rader-bold'>{children}</span>
    ),
  },
  list: components.list,
}

/** deterministic tiny variation, avoids hydration mismatch */
function hashToFloat01(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // 0..1
  return (h >>> 0) / 4294967295
}

function BrushTitle({
  children,
  seed,
  color = '#9AB1FF',
  className = '',
}: {
  children: React.ReactNode
  seed: string
  color?: string
  className?: string
}) {
  // small deterministic “hand placed” feel
  const r = hashToFloat01(seed)
  const rotate = (r * 6 - 3).toFixed(2) // -3..+3 deg
  const y = ((r * 6 - 3) * 0.6).toFixed(2) // -1.8..+1.8 px

  return (
    <h3
      className={['font-rader-bold text-2xl text-black', className].join(' ')}
    >
      <span
        className='relative inline-block leading-none'
        style={{ transform: `translateY(${y}px) rotate(${rotate}deg)` }}
      >
        <RealBrush
          seed={`credits-title:${seed}`}
          color={color}
          className='absolute -inset-x-3 -inset-y-2 -z-10 opacity-90'
          style={{
            // slightly taller brush; keeps it visible behind caps
            height: '1.35em',
            top: '70%',
            transform: 'translateY(-52%)',
          }}
        />
        <span className='relative z-10'>{children}</span>
      </span>
    </h3>
  )
}

export function ProjectCredits({
  credits,
  press,
  tournee,
}: ProjectCreditsProps) {
  if (!credits && !press && !tournee) return null

  return (
    <div className='mt-12'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12'>
        {/* LEFT COLUMN: CREDITS */}
        <div>
          {credits && (
            <div className='group relative focus:outline-none' tabIndex={0}>
              <BrushTitle seed='credits' color='#D9D9D9' className='mb-4'>
                Credits
              </BrushTitle>

              <div className='leading-tight overflow-hidden transition-all duration-500 ease-in-out max-h-[400px] group-hover:max-h-[2000px] group-focus:max-h-[2000px] text-sm lg:text-lg ml-0'>
                <PortableText value={credits} components={components} />
                <div className='h-4' />
              </div>

              <div className='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-0 group-focus:opacity-0' />
            </div>
          )}
        </div>

        <div className='space-y-24'>
          {press && (
            <>
              <BrushTitle seed='press' color='#D9D9D9' className='mb-4'>
                Press
              </BrushTitle>
              <div className='text-sm lg:text-lg'>
                <PortableText value={press} components={components} />
              </div>
            </>
          )}

          {tournee && (
            <>
              <BrushTitle seed='dates' color='#D9D9D9' className='mb-4 mt-8'>
                Dates
              </BrushTitle>
              <div className='text-sm lg:text-lg'>
                <PortableText value={tournee} components={tourneeComponents} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
