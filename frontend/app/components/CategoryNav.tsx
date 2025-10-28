'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'
import VerticalLine from './lines/VerticalLine'
import HorizontalLine from './lines/HorizontalLine'

interface CategoryNavProps {
  categories: {
    id: string
    title: string
    titleImageUrl?: string
  }[]
  onSelectCategory?: (id: string) => void
  selectedCategory?: string | null
}

export default function CategoryNav({
  categories,
  onSelectCategory,
  selectedCategory,
}: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    selectedCategory || null
  )
  const [isHovered, setIsHovered] = useState(false)

  // Keep local state in sync with prop
  useEffect(() => {
    if (selectedCategory !== undefined) {
      setActiveCategory(selectedCategory)
    }
  }, [selectedCategory])

  // Update active category on scroll (only for project page)
  useEffect(() => {
    if (!onSelectCategory) {
      // Only add scroll listener if we're not filtering
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100
        for (let i = categories.length - 1; i >= 0; i--) {
          const section = document.getElementById(
            `category-${categories[i].id}`
          )
          if (section && section.offsetTop <= scrollPosition) {
            setActiveCategory(categories[i].id)
            break
          }
        }
      }

      window.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [categories, onSelectCategory])

  if (categories.length === 0) return null

  return (
    <motion.div
      className='fixed top-8 right-8 z-40 flex items-start'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={false}
      animate={{
        x: isHovered ? 0 : 180,
      }}
      transition={{
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      <div className='flex items-start'>
        {/* Title and line */}
        <div className='flex flex-shrink-0 -mr-1 pt-2 pl-2 relative'>
          <Image
            src='/images/WoronoffByCategory.png'
            alt='Woronoff By Category'
            width={600}
            height={600}
            className='object-contain h-10 w-auto select-none pointer-events-none'
          />
          <HorizontalLine className='w-10' theme={{ fill: 'black' }} />
        </div>

        {/* Category list */}
        <ul className='space-y-0 relative ml-2'>
          <div className='absolute left-0 top-0 h-full'>
            <VerticalLine className='h-full' theme={{ fill: 'black' }} />
          </div>
          {categories.map((category) => (
            <li className='ml-2' key={category.id}>
              <a
                href={onSelectCategory ? '#' : `#category-${category.id}`}
                className={`block w-fit px-2 py-1 text-sm transition-colors ${
                  activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  if (onSelectCategory) {
                    onSelectCategory(category.id)
                  } else {
                    document
                      .getElementById(`category-${category.id}`)
                      ?.scrollIntoView({ behavior: 'smooth' })
                    setActiveCategory(category.id)
                  }
                }}
              >
                {category.titleImageUrl ? (
                  <Image
                    src={category.titleImageUrl}
                    alt={category.title}
                    width={120}
                    height={40}
                    className={`object-contain h-8 w-auto ${
                      activeCategory === category.id
                        ? 'filter brightness-0 invert'
                        : ''
                    }`}
                  />
                ) : (
                  category.title
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
