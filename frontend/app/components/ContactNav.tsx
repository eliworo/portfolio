'use client'

import ReactDOM from 'react-dom'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { FiInstagram } from 'react-icons/fi'
import { BiLogoFacebookSquare } from 'react-icons/bi'
import HorizontalLine from './lines/HorizontalLine'
import RealBrush from './drawings/RealBrush'
import VerticalLine from './lines/VerticalLine'
const CONTACT_BRUSH_COLOR = '#E5E7EB'
interface ContactNavProps {
  contact: {
    email?: string | null
    instagram?: string | null
    facebook?: string | null
  } | null
  cv?: { asset?: { url?: string | null } | null } | null
  contactImageUrl?: string | null
}

export default function ContactNav({
  contact,
  cv,
  contactImageUrl,
}: ContactNavProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)
  const [titleWidth, setTitleWidth] = useState(0)
  const [isMeasured, setIsMeasured] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const navItems = [
    {
      id: 'email',
      title: contact?.email,
      href: contact?.email ? `mailto:${contact.email}` : undefined,
    },
    {
      id: 'instagram',
      title: 'Instagram',
      href: contact?.instagram || undefined,
    },
    {
      id: 'facebook',
      title: 'Facebook',
      href: contact?.facebook || undefined,
    },
    {
      id: 'cv',
      title: 'Download CV',
      href: cv?.asset?.url || undefined,
    },
  ].filter((item) => item.href)

  useEffect(() => {
    if (!contentRef.current || !titleRef.current) return

    const updateWidths = () => {
      if (contentRef.current && titleRef.current) {
        const fullWidth = contentRef.current.offsetWidth
        const titleW = titleRef.current.offsetWidth
        setContentWidth(fullWidth)
        setTitleWidth(titleW)
        setIsMeasured(true)
      }
    }

    const timer = setTimeout(updateWidths, 10)

    const resizeObserver = new ResizeObserver(updateWidths)
    resizeObserver.observe(contentRef.current)
    resizeObserver.observe(titleRef.current)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [navItems])

  useEffect(() => {
    if (!isHovered) return

    const onPointerDown = (e: PointerEvent) => {
      const menuEl = menuRef.current
      if (!menuEl) return

      // If the click is outside the menu, close it
      if (!menuEl.contains(e.target as Node)) {
        setIsHovered(false)
      }
    }

    // Use capture so we reliably detect outside clicks even if something stops propagation
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [isHovered])

  if (!navItems.length) return null

  const horizontalLineWidth = 40
  const visibleOffset = titleWidth + horizontalLineWidth / 2
  const hideOffset = isMeasured ? contentWidth - visibleOffset + 50 : 1000

  return (
    <motion.div
      className='fixed bottom-4 xl:top-8 right-4 z-40 flex items-start pointer-events-none'
      initial={{ x: hideOffset }}
      animate={{
        x: isHovered ? 0 : hideOffset,
      }}
      transition={{
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      {/* Invisible hover bridge for easier hover on desktop */}
      <div
        className='absolute -right-4 top-0 w-12 h-20 pointer-events-auto hidden xl:block'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <BlurryBackdrop show={isHovered} />
      <div
        className='flex items-end xl:items-start pointer-events-auto'
        ref={(node) => {
          contentRef.current = node
          menuRef.current = node
        }}
        onMouseEnter={() => window.innerWidth >= 1280 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 1280 && setIsHovered(false)}
        onClick={() => {
          if (window.innerWidth < 1280) {
            setIsHovered((prev) => !prev)
          }
        }}
      >
        <div
          className='flex flex-shrink-0 -mr-1 pt-2 pl-0 relative'
          ref={titleRef}
        >
          {contactImageUrl && (
            <div className='relative'>
              {/* RealBrush underneath */}
              <div
                className='absolute inset-x-0 top-1/2 -translate-y-[45%] -z-10 pointer-events-none xl:hidden'
                style={{ height: '100%' }}
              >
                <RealBrush
                  seed='contact-nav:title'
                  color={CONTACT_BRUSH_COLOR}
                  className='absolute -inset-x-3'
                  style={{ height: 44 }}
                />
              </div>

              <Image
                src={contactImageUrl}
                alt='Contact'
                width={1000}
                height={1000}
                className='object-contain h-10 xl:h-12 w-auto select-none pointer-events-none relative z-10'
              />
            </div>
          )}
          <HorizontalLine className='w-8 xl:w-10' theme={{ fill: 'black' }} />{' '}
          {/* slightly smaller */}
        </div>

        <ul className='-space-y-1 relative ml-1'>
          <div className='absolute left-0 top-0 h-full'>
            <VerticalLine className='h-full' theme={{ fill: 'black' }} />
          </div>
          {navItems.map((item) => (
            <li className='ml-1' key={item.id}>
              <a
                href={item.href}
                target={item.id !== 'email' ? '_blank' : undefined}
                rel={item.id !== 'email' ? 'noopener noreferrer' : undefined}
                className='block w-fit px-2 py-1 text-sm xl:text-sm transition-colors cursor-pointer whitespace-nowrap hover:opacity-70' // smaller text
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

function BlurryBackdrop({ show }: { show: boolean }) {
  const mounted = useMounted()

  // During SSR/first render, there is no document; render nothing.
  if (!mounted) return null

  // At this point, we're guaranteed to be in the browser.
  return ReactDOM.createPortal(
    <AnimatePresence>
      {show ? (
        <motion.div
          key='contact-nav-backdrop'
          className='fixed inset-0 z-30'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          style={{
            background: 'rgba(255,255,255,0.30)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
