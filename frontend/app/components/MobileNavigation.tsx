'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { NavigationImagesQueryResult } from '@/sanity.types'
import HamburgerHorizontalLine from './lines/HamburgerHorizontalLine'

type MobileNavigationProps = {
  navImages: NavigationImagesQueryResult
}
export default function MobileNavigation({ navImages }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleMenu = () => setIsOpen(!isOpen)

  const getImageUrl = (title: string): string | undefined => {
    switch (title) {
      case 'WORKS':
        return navImages?.works?.titleImage?.asset?.url ?? undefined
      case 'ABOUT':
        return navImages?.about?.titleImage?.asset?.url ?? undefined
      case 'COMMISSIONS':
        return navImages?.commissions?.titleImage?.asset?.url ?? undefined
      default:
        return undefined
    }
  }

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={toggleMenu}
        className='fixed top-8 left-4 z-50 flex flex-col -space-y-0.5'
      >
        <HamburgerHorizontalLine
          theme={{ fill: 'black' }}
          className='w-16 h-auto'
        />
        <HamburgerHorizontalLine
          theme={{ fill: 'black' }}
          className='w-16 h-auto'
        />
        <HamburgerHorizontalLine
          theme={{ fill: 'black' }}
          className='w-16 h-auto'
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-40 bg-white/30 backdrop-blur-md flex flex-col justify-center items-center space-y-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {['WORKS', 'ABOUT', 'COMMISSIONS'].map((title) => {
              const imageUrl = getImageUrl(title)

              return (
                <div key={title} className='text-2xl font-medium text-black'>
                  <button
                    onClick={() =>
                      title === 'WORKS'
                        ? setActiveCategory(
                            activeCategory === title ? null : title
                          )
                        : setIsOpen(false)
                    }
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={title}
                        width={300}
                        height={100}
                        className='w-full h-auto object-contain'
                        style={{ maxHeight: '80px' }}
                      />
                    ) : (
                      <span className='text-4xl font-bold'>{title}</span>
                    )}
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
