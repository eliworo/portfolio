'use client'

import { PortableText, PortableTextComponents } from '@portabletext/react'
import { PortableTextBlock } from 'sanity'

interface ProjectCreditsProps {
  credits?: PortableTextBlock[] | null
  press?: PortableTextBlock[] | null
  tournee?: PortableTextBlock[] | null
}

const components: PortableTextComponents = {
  marks: {
    strong: ({ children }) => (
      <strong className='font-agrandir-bold'>{children}</strong>
    ),
    em: ({ children }) => <em className='font-agrandir-italic'>{children}</em>,
    underline: ({ children }) => <span className='underline'>{children}</span>,
    link: ({ value, children }) => {
      const href = (value as { href?: string })?.href ?? '#'
      return (
        <a
          href={href}
          className='text-blue-600 underline'
          target='_blank'
          rel='noopener noreferrer'
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
        <div>
          {credits && (
            <>
              <h3 className='font-agrandir-bold uppercase text-xl mb-4'>
                Crédits
              </h3>
              <div className='prose'>
                <PortableText value={credits} components={components} />
              </div>
            </>
          )}
        </div>

        <div>
          {press && (
            <>
              <h3 className='font-agrandir-bold uppercase text-xl mb-4'>
                Press
              </h3>
              <div className='prose'>
                <PortableText value={press} components={components} />
              </div>
            </>
          )}

          {tournee && (
            <>
              <h3 className='font-agrandir-bold uppercase text-xl mb-4 mt-8'>
                Tournée
              </h3>
              <div className='prose'>
                <PortableText value={tournee} components={components} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
