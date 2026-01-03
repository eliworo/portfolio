'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import RealBrush from '../components/drawings/RealBrush'

export default function CategoryPortableLink({
  category,
  children,
  seed,
  scrollToId = 'studio-works-grid',
}: {
  category: string
  children: React.ReactNode
  seed: string
  scrollToId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const href = `${pathname}?category=${encodeURIComponent(category)}`

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return
    e.preventDefault()

    router.push(href, { scroll: false })

    requestAnimationFrame(() => {
      document.getElementById(scrollToId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <a href={href} onClick={onClick} className='text-black  no-underline'>
      <span className='underline decoration-black decoration-dashed underline-offset-4 hover:opacity-70 transition-opacity visited:opacity-60'>
        <RealBrush
          as='span'
          seed={seed}
          color='#ccc'
          className='absolute -inset-x-1 -z-10 opacity-0 pointer-events-none'
          style={{
            height: '0.9em',
            top: '58%',
            transform: 'translateY(-50%)',
          }}
        />
        <span className='relative z-10'>{children}</span>
      </span>
    </a>
  )
}
