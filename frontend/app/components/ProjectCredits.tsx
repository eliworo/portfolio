'use client'

import { PortableText, PortableTextComponents } from '@portabletext/react'
import Link from 'next/link'
import { PortableTextBlock } from 'sanity'

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
      // Check if children contains any React elements (like links)
      const hasComplexChildren =
        Array.isArray(children) &&
        children.some((child) => typeof child === 'object' && child !== null)

      // If there are complex children (links, etc.), render them directly
      if (hasComplexChildren) {
        return (
          <p className='mb-5 last:mb-0 whitespace-pre-wrap leading-relaxed text-base lg:text-lg'>
            {children}
          </p>
        )
      }

      // Otherwise, try to parse the text format
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
              <h3 className='font-rader-bold text-3xl mb-4 text-black'>
                Credits
              </h3>

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
              <h3 className='font-rader-bold text-3xl mb-4 text-black py-0'>
                Press
              </h3>
              <div className='text-sm lg:text-lg'>
                <PortableText value={press} components={components} />
              </div>
            </>
          )}

          {tournee && (
            <>
              <h3 className='font-rader-bold text-3xl mb-4 text-black py-0 mt-8'>
                Dates
              </h3>
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
