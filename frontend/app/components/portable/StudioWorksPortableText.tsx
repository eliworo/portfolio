import React from 'react'
import { PortableText } from '@portabletext/react'
import CategoryPortableLink from '../CategoryPortableLink'
import { BrushMark } from './BrushMark'

function StrongMark({ children }: { children: React.ReactNode }) {
  return (
    <BrushMark seed='strong' color='#ccc'>
      {children}
    </BrushMark>
  )
}

function LinkMark({
  children,
  value,
}: {
  children: React.ReactNode
  value?: { href?: string }
}) {
  const href = value?.href || '#'

  // category links
  if (href.startsWith('?category=')) {
    const category = href.replace('?category=', '')
    return (
      <CategoryPortableLink
        category={category}
        seed={`category-link-${category}`}
        scrollToId='studio-works-grid'
      >
        {children}
      </CategoryPortableLink>
    )
  }

  const isExternal = /^https?:\/\//i.test(href)

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className='underline decoration-2 underline-offset-4 hover:bg-yellow-100 transition-colors visited:opacity-60'
    >
      {children}
    </a>
  )
}

const components = {
  marks: {
    strong: StrongMark,
    link: LinkMark,
  },
}

export default function StudioWorksPortableText({ value }: { value: any }) {
  return <PortableText value={value} components={components} />
}
