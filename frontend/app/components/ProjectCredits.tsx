'use client'

import { PortableText, PortableTextComponents } from '@portabletext/react'
import { PortableTextBlock } from 'sanity'
import RealBrush from './drawings/RealBrush'
import Image from 'next/image'
import PortableLinkMark from '@/app/components/portable/PortableLinkMark'

interface ProjectCreditsProps {
  credits?: PortableTextBlock[] | null
  press?: PortableTextBlock[] | null
  tournee?: PortableTextBlock[] | null
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
    // strong: ({ children }) => (
    //   <strong className='font-rader-bold'>{children}</strong>
    // ),
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span className='underline'>{children}</span>,
    link: ({ value, children }) => (
      <PortableLinkMark value={value as any}>{children}</PortableLinkMark>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className='list-none ml-0 space-y-2'>{children}</ul>
    ),
    number: ({ children }) => <ol className='list-decimal ml-6'>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className='relative inline-block mb-2'>
        <span className='relative inline-block align-baseline pl-1'>
          <RealBrush
            as='span'
            seed={`bullet-${Math.random()}`}
            color='#D9D9D9'
            className='absolute -inset-x-2 -z-10 opacity-90'
            style={{
              height: '1.2em',
              top: '55%',
              transform: 'translateY(-50%)',
            }}
          />
          <span className='relative z-10'>{children}</span>
        </span>
      </li>
    ),
    number: ({ children }) => <li>{children}</li>,
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
        /^([\d\-\s]+(?:to[\d\-\s]+)?)\s+(.+?)\s+\(([A-Z]{2,})\)$/i,
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
  },
  list: components.list,
  listItem: components.listItem,
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
  // small deterministic "hand placed" feel
  const r = hashToFloat01(seed)
  const rotate = (r * 6 - 3).toFixed(2) // -3..+3 deg
  const y = ((r * 6 - 3) * 0.6).toFixed(2) // -1.8..+1.8 px

  return (
    <h3 className={['font-rader-bold text-xl text-black', className].join(' ')}>
      <span
        className='relative inline-block leading-none'
        // style={{ transform: `translateY(${y}px) rotate(${rotate}deg)` }}
        style={{ transform: `translateY(${y}px)` }}
      >
        <RealBrush
          seed={`credits-title:${seed}`}
          color={color}
          className='absolute -inset-x-2 -inset-y-2 -z-10 opacity-90'
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
              {/* <BrushTitle
                seed='credits'
                color='#D9D9D9'
                className='mb-4 text-sm lg:text-lg'
              >
                Credits
              </BrushTitle> */}

              <Image
                src={'/images/CreditsLogo.png'}
                alt='PRODUCTIONS'
                width={800}
                height={215}
                className='h-7 w-auto mb-4'
              />

              <div className='leading-snug overflow-hidden transition-all duration-500 ease-in-out max-h-[400px] group-hover:max-h-[2000px] group-focus:max-h-[2000px] text-sm lg:text-lg ml-0'>
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
              {/* <BrushTitle
                seed='press'
                color='#D9D9D9'
                className='mb-4 text-sm lg:text-lg'
              >
                Press
              </BrushTitle> */}
              <div className='text-sm lg:text-lg'>
                <Image
                  src={'/images/pressLogo.png'}
                  alt='PRODUCTIONS'
                  width={800}
                  height={335}
                  className='h-7 w-auto mb-4'
                />
                <PortableText value={press} components={components} />
              </div>
            </>
          )}

          {tournee && (
            <>
              {/* <BrushTitle
                seed='dates'
                color='#D9D9D9'
                className='mb-4 mt-8 text-sm lg:text-lg'
              >
                Dates
              </BrushTitle> */}
              <div className='text-sm lg:text-lg'>
                <Image
                  src={'/images/datesLogo.png'}
                  alt='PRODUCTIONS'
                  width={800}
                  height={297}
                  className='h-7 w-auto mb-4'
                />
                <PortableText value={tournee} components={tourneeComponents} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
