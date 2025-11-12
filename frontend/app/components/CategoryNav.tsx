'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import VerticalLine from './lines/VerticalLine'
import HorizontalLine from './lines/HorizontalLine'
import PaintBrush from './drawings/PaintBrush'

interface CategoryNavProps {
  items?: Array<{
    id: string
    title: string
    titleImageUrl?: string
    slug?: string
  }>
  categories?: Array<{
    id: string
    title: string
    titleImageUrl?: string
  }>
  onSelectItem?: (id: string | null) => void
  onSelectCategory?: (id: string | null) => void
  selectedItem?: string | null
  selectedCategory?: string | null
  title: string
  isStudioWorks?: boolean
  isProjectPage?: boolean
  groupSlug?: string
}

export default function CategoryNav({
  items,
  categories,
  onSelectItem,
  onSelectCategory,
  selectedItem,
  selectedCategory,
  title,
  isStudioWorks,
  isProjectPage,
  groupSlug,
}: CategoryNavProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)
  const [titleWidth, setTitleWidth] = useState(0)
  const [isMeasured, setIsMeasured] = useState(false)

  const navItems = useMemo(() => items ?? categories ?? [], [items, categories])
  const onSelect = useMemo(
    () => onSelectItem ?? onSelectCategory,
    [onSelectItem, onSelectCategory]
  )
  const selected = useMemo(
    () => selectedItem ?? selectedCategory ?? null,
    [selectedItem, selectedCategory]
  )

  const [activeItem, setActiveItem] = useState<string | null>(selected)
  const [isHovered, setIsHovered] = useState(false)

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
  }, [navItems, title])

  useEffect(() => {
    setActiveItem(selected)
  }, [selected])

  useEffect(() => {
    if (isProjectPage && !onSelect) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100
        for (let i = navItems.length - 1; i >= 0; i--) {
          const section = document.getElementById(navItems[i].id)
          if (section && section.offsetTop <= scrollPosition) {
            setActiveItem(navItems[i].id)
            break
          }
        }
      }
      window.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [navItems, onSelect, isProjectPage])

  const handleItemClick = useCallback(
    (item: any, e: React.MouseEvent) => {
      e.preventDefault()

      if (onSelect) {
        if (item.id === activeItem) {
          onSelect(null)
          setActiveItem(null)
        } else {
          onSelect(item.id)
        }
      } else if (isProjectPage) {
        const element = document.getElementById(item.id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
          setActiveItem(item.id)
        }
      } else if (isStudioWorks) {
        router.push(`/${groupSlug}/c/${item.id}`)
      } else if (item.slug) {
        router.push(`/${groupSlug}/${item.slug}`)
      }
    },
    [onSelect, isProjectPage, isStudioWorks, groupSlug, router, activeItem]
  )

  if (!navItems || navItems.length === 0) return null

  const isImageTitle = title === 'woronoff by category'

  const horizontalLineWidth = 40
  const visibleOffset = titleWidth + horizontalLineWidth / 2
  const hideOffset = isMeasured ? contentWidth - visibleOffset + 50 : 1000

  return (
    <motion.div
      className='fixed top-8 right-4 z-40 flex items-start'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ x: hideOffset }}
      animate={{
        x: isHovered ? 0 : hideOffset,
      }}
      transition={{
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      <div className='flex items-start' ref={contentRef}>
        <div
          className='flex flex-shrink-0 -mr-1 pt-2 pl-2 relative'
          ref={titleRef}
        >
          {isImageTitle ? (
            <Image
              src='/images/WoronoffByCategory.png'
              alt='Woronoff By Category'
              width={600}
              height={600}
              className='object-contain h-10 w-auto select-none pointer-events-none'
            />
          ) : (
            <span className='text-sm font-medium select-none pointer-events-none whitespace-nowrap'>
              {title}
            </span>
          )}
          <HorizontalLine className='w-10' theme={{ fill: 'black' }} />
        </div>

        <ul className='space-y-0 relative ml-2'>
          <div className='absolute left-0 top-0 h-full'>
            <VerticalLine className='h-full' theme={{ fill: 'black' }} />
          </div>
          {navItems.map((item) => (
            <li className='ml-2' key={item.id}>
              <div className='relative inline-block'>
                {activeItem === item.id && (
                  <PaintBrush
                    className='absolute bottom-0 left-1/2 transform -translate-x-1/2 -z-10 w-full h-8'
                    theme={{ fill: '#9AB1FF' }}
                  />
                )}
                <button
                  className={`block w-fit px-2 py-1 text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    activeItem === item.id ? 'text-white relative z-10' : ''
                  }`}
                  onClick={(e) => handleItemClick(item, e)}
                >
                  {item.titleImageUrl ? (
                    <Image
                      src={item.titleImageUrl}
                      alt={item.title}
                      width={120}
                      height={40}
                      className='object-contain h-8 w-auto'
                    />
                  ) : (
                    item.title
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
