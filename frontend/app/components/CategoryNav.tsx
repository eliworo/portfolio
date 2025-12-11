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
  projectTitleImageUrl?: string
  isStudioWorks?: boolean
  isProjectPage?: boolean
  isProductionsPage?: boolean
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
  projectTitleImageUrl,
  isStudioWorks,
  isProjectPage,
  isProductionsPage,
  groupSlug,
}: CategoryNavProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLUListElement>(null)
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
  }, [navItems, title, projectTitleImageUrl])

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
      } else if (isProductionsPage) {
        router.push(`/productions/${item.slug}`)
      } else if (isStudioWorks) {
        router.push(`/${groupSlug}/c/${item.id}`)
      } else if (item.slug) {
        router.push(`/${groupSlug}/${item.slug}`)
      }
    },
    [
      onSelect,
      isProjectPage,
      isStudioWorks,
      groupSlug,
      router,
      activeItem,
      isProductionsPage,
    ]
  )

  if (!navItems || navItems.length === 0) return null

  const isImageTitle =
    title === 'woronoff by category' || title === 'projects by woronoff'

  const horizontalLineWidth = 40
  const visibleOffset = titleWidth + horizontalLineWidth / 2

  const hideOffset = isMeasured ? contentWidth - visibleOffset + 50 : 1000

  return (
    <>
      {isHovered && window.innerWidth < 1280 && (
        <div
          className='fixed inset-0 z-20 bg-white/30 backdrop-blur-sm transition-opacity duration-300'
          onClick={() => setIsHovered(false)}
        />
      )}
      <motion.div
        className='fixed bottom-8 xl:top-8 right-4 z-30 flex items-start pointer-events-none'
        initial={{ x: hideOffset }}
        animate={{
          x: isHovered
            ? typeof window !== 'undefined' && window.innerWidth < 1280
              ? -(titleWidth - horizontalLineWidth)
              : 0
            : hideOffset,
        }}
        transition={{
          duration: 0.5,
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        {/* Invisible bridge that moves with the menu */}
        <div
          className='absolute -right-4 top-0 w-16 h-20 pointer-events-auto hidden xl:block'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />

        <div
          className='flex items-end xl:items-start'
          ref={contentRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Title area */}
          <div
            className='flex flex-shrink-0 -mr-1 pt-2 pl-2 relative pointer-events-auto'
            ref={titleRef}
            onClick={() => {
              if (window.innerWidth < 1280) {
                setIsHovered((prev) => !prev)
              }
            }}
          >
            {isImageTitle ? (
              <div className='relative flex items-center gap-2'>
                <PaintBrush
                  className='absolute top-1/2 -translate-y-[45%] -rotate-1 w-[110%] h-[80%] -z-10'
                  theme={{ fill: '#98D8C8' }}
                />
                {projectTitleImageUrl && isProjectPage ? (
                  <>
                    <Image
                      src={projectTitleImageUrl}
                      alt='Project Title'
                      width={400}
                      height={400}
                      className='object-contain h-8 w-auto select-none pointer-events-none'
                    />
                    <Image
                      src='/images/ByCategory.png'
                      alt='By Category'
                      width={400}
                      height={400}
                      className='object-contain h-8 w-auto select-none pointer-events-none'
                    />
                  </>
                ) : (
                  <Image
                    src={
                      title === 'projects by woronoff'
                        ? '/images/WoronoffByProject.png'
                        : '/images/WoronoffByCategory-2.png'
                    }
                    alt='Woronoff By Category'
                    width={600}
                    height={600}
                    className='object-contain h-10 w-auto select-none pointer-events-none'
                  />
                )}
              </div>
            ) : (
              <span className='text-sm font-medium select-none pointer-events-none whitespace-nowrap'>
                {title}
              </span>
            )}
            <HorizontalLine className='w-10' theme={{ fill: 'black' }} />
          </div>

          <ul
            ref={categoriesRef}
            className='space-y-0 relative ml-2 min-w-[200px] lg:min-w-0 pointer-events-auto'
          >
            <div className='absolute left-0 top-0 h-full'>
              <VerticalLine className='h-full' theme={{ fill: 'black' }} />
            </div>
            {navItems.map((item) => (
              <li className='ml-6' key={item.id}>
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
                        width={200}
                        height={200}
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
    </>
  )
}
