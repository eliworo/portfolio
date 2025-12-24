'use client'

import { PortableText, PortableTextComponents } from '@portabletext/react'
import Link from 'next/link'
import { PortableTextBlock } from 'sanity'

interface ProjectCreditsProps {
  credits?: PortableTextBlock[] | null
  press?: PortableTextBlock[] | null
  tournee?: PortableTextBlock[] | null
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className='mb-4 last:mb-0 whitespace-pre-wrap'>{children}</p>
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
      <h4 className='text-lg font-semibold mb-4 whitespace-pre-wrap'>
        {children}
      </h4>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className='font-rader-bold'>{children}</strong>
    ),
    em: ({ children }) => <em className='font-agrandir-italic'>{children}</em>,
    underline: ({ children }) => <span className='underline'>{children}</span>,
    link: ({ value, children }) => {
      const isInternal = value?.linkType === 'internal'
      const href = isInternal ? value?.internalLink : value?.href
      const openInNewTab = value?.openInNewTab

      if (!href) return <span>{children}</span>

      if (isInternal) {
        return (
          <Link href={href} className='text-black underline'>
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          className='text-black underline'
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
  list: {
    bullet: ({ children }) => <ul className='list-disc ml-6'>{children}</ul>,
    number: ({ children }) => <ol className='list-decimal ml-6'>{children}</ol>,
  },
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
            // tabIndex={0} makes this div focusable (like a button).
            // This ensures the "tap" works reliably on mobile.
            <div className='group relative focus:outline-none' tabIndex={0}>
              <h3 className='font-rader-medium uppercase text-base mb-8 mt-8 text-white bg-black w-fit  px-1.5 py-0 pb-0.5'>
                Credits
              </h3>

              {/* 1. max-h-[400px]: Default clamped height (mobile & desktop).
                  2. group-hover & group-focus: Expands when hovered OR clicked (focused).
                  3. transition-all: Smooth animation.
              */}
              <div className='leading-[1.15] overflow-hidden transition-all duration-500 ease-in-out max-h-[400px] group-hover:max-h-[2000px] group-focus:max-h-[2000px] text-sm lg:text-lg ml-0'>
                <PortableText value={credits} components={components} />
                <div className='h-4' />
              </div>

              <div className='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-0 group-focus:opacity-0' />
            </div>
          )}
        </div>

        <div>
          {press && (
            <>
              <h3 className='font-rader-medium uppercase text-lg mb-4 bg-black text-white p-1 py-0'>
                Press
              </h3>
              <div className='text-sm lg:text-lg'>
                <PortableText value={press} components={components} />
              </div>
            </>
          )}

          {tournee && (
            <>
              <h3 className='font-rader-medium uppercase text-lg mb-4 mt-8 border-b border-black text-black p-1 px-0 py-0'>
                Dates
              </h3>
              <div className='text-sm lg:text-lg'>
                <PortableText value={tournee} components={components} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
