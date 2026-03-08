import React from 'react'
import { PortableText } from '@portabletext/react'
import CategoryPortableLink from '../CategoryPortableLink'
import { BrushMark } from './BrushMark'
import PortableLinkMark from './PortableLinkMark'

function StrongMark({ children }: { children?: React.ReactNode }) {
  return (
    <BrushMark seed='strong' color='#ccc'>
      {children ?? null}
    </BrushMark>
  )
}

function LinkMark({
  children,
  value,
}: {
  children?: React.ReactNode
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
        {children ?? null}
      </CategoryPortableLink>
    )
  }

  return <PortableLinkMark value={value}>{children ?? null}</PortableLinkMark>
}

const components = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className='whitespace-pre-line'>{children ?? null}</p>
    ),
  },
  marks: {
    strong: StrongMark,
    link: LinkMark,
  },
}

export default function StudioWorksPortableText({ value }: { value: any }) {
  return <PortableText value={value} components={components} />
}
