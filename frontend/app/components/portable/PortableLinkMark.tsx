import Link from 'next/link'
import { linkResolver } from '@/sanity/lib/utils'

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

type PortableLinkValue = {
  href?: string
  linkType?: 'internal' | 'external'
  internalLink?: string
  openInNewTab?: boolean
}

export default function PortableLinkMark({
  children,
  value,
  internalQueryBasePath,
}: {
  children: React.ReactNode
  value?: PortableLinkValue
  internalQueryBasePath?: string
}) {
  let href = linkResolver(value as any)
  if (!href && typeof value?.href === 'string') {
    href = value.href
  }

  if (!href) {
    return <span>{children}</span>
  }

  if (href.startsWith('?') && internalQueryBasePath) {
    href = `${internalQueryBasePath}${href}`
  }

  const isInternal =
    value?.linkType === 'internal' ||
    href.startsWith('/') ||
    href.startsWith('#') ||
    href.startsWith('?')
  const openInNewTab = Boolean(value?.openInNewTab)

  if (isInternal) {
    return (
      <Link
        href={href}
        className='underline decoration-2 underline-offset-4 hover:bg-yellow-100 transition-colors'
      >
        {children}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className='text-black no-underline border-b border-black border-dashed hover:opacity-70 transition-opacity'
      target={openInNewTab ? '_blank' : undefined}
      rel={openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {children}
      {openInNewTab && <HandArrowIcon />}
    </a>
  )
}
