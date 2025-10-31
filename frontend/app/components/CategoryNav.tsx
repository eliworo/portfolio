'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import VerticalLine from './lines/VerticalLine'
import HorizontalLine from './lines/HorizontalLine'

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
  onSelectItem?: (id: string) => void
  onSelectCategory?: (id: string) => void
  selectedItem?: string | null
  selectedCategory?: string | null
  title: string
  isStudioWorks?: boolean
  isProjectPage?: boolean
  groupSlug?: string
}

export default function CategoryNav({
  items,
  categories, // For backward compatibility
  onSelectItem,
  onSelectCategory, // For backward compatibility
  selectedItem,
  selectedCategory, // For backward compatibility
  title,
  isStudioWorks,
  isProjectPage,
  groupSlug,
}: CategoryNavProps) {
  const router = useRouter()

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

  // Keep local state in sync with prop
  useEffect(() => {
    setActiveItem(selected)
  }, [selected])

  // Update active category on scroll (ONLY for project pages without onSelect)
  useEffect(() => {
    if (isProjectPage && !onSelect) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100
        for (let i = navItems.length - 1; i >= 0; i--) {
          const section = document.getElementById(`category-${navItems[i].id}`)
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

  // Move this ABOVE any early returns (fixes rules-of-hooks)
  const handleItemClick = useCallback(
    (item: any, e: React.MouseEvent) => {
      e.preventDefault()

      if (onSelect) {
        onSelect(item.id)
      } else if (isProjectPage) {
        const element = document.getElementById(`category-${item.id}`)
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
    [onSelect, isProjectPage, isStudioWorks, groupSlug, router]
  )

  if (!navItems || navItems.length === 0) return null

  const isImageTitle = title === 'woronoff by category'

  return (
    <motion.div
      className='fixed top-8 right-4 z-40 flex items-start'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={false}
      animate={{
        x: isHovered ? 0 : isImageTitle ? 110 : 140,
      }}
      transition={{
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      <div className='flex items-start'>
        {/* Title and line */}
        <div className='flex flex-shrink-0 -mr-1 pt-2 pl-2 relative'>
          {isImageTitle ? (
            <Image
              src='/images/WoronoffByCategory.png'
              alt='Woronoff By Category'
              width={600}
              height={600}
              className='object-contain h-10 w-auto select-none pointer-events-none'
            />
          ) : (
            <span className='text-sm font-medium select-none pointer-events-none'>
              {title}
            </span>
          )}
          <HorizontalLine className='w-10' theme={{ fill: 'black' }} />
        </div>

        {/* Items list */}
        <ul className='space-y-0 relative ml-2'>
          <div className='absolute left-0 top-0 h-full'>
            <VerticalLine className='h-full' theme={{ fill: 'black' }} />
          </div>
          {navItems.map((item) => (
            <li className='ml-2' key={item.id}>
              <button
                className={`block w-fit px-2 py-1 text-sm transition-colors cursor-pointer ${
                  activeItem === item.id
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={(e) => handleItemClick(item, e)}
              >
                {item.titleImageUrl ? (
                  <Image
                    src={item.titleImageUrl}
                    alt={item.title}
                    width={120}
                    height={40}
                    className={`object-contain h-8 w-auto ${
                      activeItem === item.id ? 'filter brightness-0 invert' : ''
                    }`}
                  />
                ) : (
                  item.title
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
