'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import HorizontalLine from './lines/HorizontalLine'
import VerticalLine from './lines/VerticalLine'
import { NavigationImagesQueryResult } from '@/sanity.types'

type NavigationProps = {
  navImages: NavigationImagesQueryResult
}

function buildNavStructure(navImages: NavigationProps['navImages']) {
  const mainCategories = [
    // {
    //   title: 'WORKS',
    //   slug: '/works',
    //   subCategories:
    //     navImages?.projectGroups?.map((group) => ({
    //       title: group.title?.toUpperCase(),
    //       slug: `/${group.slug}`,
    //       titleImage: group.titleImage,
    //       projects:
    //         group.projects?.map((project) => ({
    //           title: project.title,
    //           slug: `/${group.slug}/p/${project.slug}`,
    //           titleImage: project.titleImage,
    //           coverImage: project.coverImage,
    //         })) ?? [],
    //     })) ?? [],
    // },
    { title: 'ABOUT', slug: '/about' },
    { title: 'COMMISSIONS', slug: '/commissions' },
  ]

  return { mainCategories }
}

export default function Navigation({ navImages }: NavigationProps) {
  const navigationData = buildNavStructure(navImages)

  // states
  const [showMenu, setShowMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null
  )

  // refs/timers for hover delay
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const HIDE_DELAY = 150

  function clearHoverTimeout() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  function handleMouseEnter() {
    clearHoverTimeout()
    setShowMenu(true)
  }

  function handleMouseLeave() {
    clearHoverTimeout()
    hoverTimeoutRef.current = setTimeout(() => {
      setShowMenu(false)
      setActiveCategory(null)
      setActiveSubCategory(null)
    }, HIDE_DELAY)
  }

  const menuVariants = {
    hidden: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <>
      {/* Blurry backdrop */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className='fixed inset-0 bg-white/30 backdrop-blur-md z-40 pointer-events-none'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='fixed left-10 top-1/2 -translate-y-1/2 z-50 flex items-center'
      >
        <>
          <Link href='/' className='cursor-pointer relative z-10'>
            {navImages?.homepage?.logo?.asset?.url ? (
              <Image
                src={navImages.homepage.logo.asset.url}
                alt='E'
                width={120}
                height={120}
                className='object-contain'
              />
            ) : (
              <div className='text-6xl font-bold'>E</div>
            )}
          </Link>

          <AnimatePresence>
            {showMenu && (
              <div className='flex items-center ml-2'>
                <div className='px-3 py-2 -mx-3 flex items-center'>
                  <HorizontalLine className='w-24' theme={{ fill: 'black' }} />
                </div>

                <motion.div
                  className='relative'
                  variants={menuVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  <ul className='flex flex-col space-y-3 pl-4 relative'>
                    <div className='absolute left-0 top-0 h-full'>
                      <VerticalLine
                        className='h-full'
                        theme={{ fill: 'black' }}
                      />
                    </div>
                    {navigationData.mainCategories.map((category) => {
                      let imageUrl = null

                      if (
                        category.title === 'WORKS' &&
                        navImages?.works?.titleImage?.asset?.url
                      ) {
                        imageUrl = navImages.works.titleImage.asset.url
                      } else if (
                        category.title === 'ABOUT' &&
                        navImages?.about?.titleImage?.asset?.url
                      ) {
                        imageUrl = navImages.about.titleImage.asset.url
                      } else if (
                        category.title === 'COMMISSIONS' &&
                        navImages?.commissions?.titleImage?.asset?.url
                      ) {
                        imageUrl = navImages.commissions.titleImage.asset.url
                      }

                      return (
                        <li key={category.title} className='relative w-fit'>
                          <div
                            className={`cursor-pointer hover:opacity-90 transition-opacity`}
                            onMouseEnter={() =>
                              setActiveCategory(category.title)
                            }
                          >
                            <Link href={category.slug}>
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={category.title}
                                  width={150}
                                  height={50}
                                  style={{
                                    width: 'auto',
                                    maxHeight: '35px',
                                  }}
                                  className='object-contain'
                                />
                              ) : (
                                <span
                                  className={`text-lg font-medium ${
                                    activeCategory === category.title
                                      ? 'font-bold'
                                      : ''
                                  }`}
                                >
                                  {category.title}
                                </span>
                              )}
                            </Link>
                          </div>

                          {/* Subcategories */}
                          {/* <AnimatePresence>
                            {activeCategory === category.title &&
                              category.subCategories &&
                              category.subCategories.length > 0 && (
                                <div className='flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-4 w-[40vw]'>
                                  <HorizontalLine
                                    className='w-24'
                                    theme={{ fill: 'black' }}
                                  />

                                  <motion.div
                                    className='relative'
                                    variants={menuVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='hidden'
                                  >
                                    <ul className='flex flex-col space-y-3 pl-3 relative'>
                                      <div className='absolute left-0 top-0 h-full'>
                                        <VerticalLine
                                          className='h-full'
                                          theme={{ fill: 'black' }}
                                        />
                                      </div>
                                      {category.subCategories.map(
                                        (subCategory) => {
                                          const hasImage =
                                            subCategory?.titleImage?.asset?.url

                                          return (
                                            <li
                                              key={subCategory.title}
                                              className='relative w-fit'
                                            >
                                              <div
                                                className={`cursor-pointer hover:opacity-90 transition-opacity`}
                                                onMouseEnter={() =>
                                                  setActiveSubCategory(
                                                    subCategory.title ?? null
                                                  )
                                                }
                                              >
                                                <Link href={subCategory.slug}>
                                                  {hasImage ? (
                                                    <Image
                                                      src={
                                                        subCategory.titleImage
                                                          ?.asset?.url || ''
                                                      }
                                                      alt={
                                                        subCategory.title || ''
                                                      }
                                                      width={150}
                                                      height={50}
                                                      style={{
                                                        width: 'auto',
                                                        maxHeight: '35px',
                                                      }}
                                                      className='object-contain'
                                                    />
                                                  ) : (
                                                    <span
                                                      className={`text-lg font-medium ${
                                                        activeSubCategory ===
                                                        subCategory.title
                                                          ? 'font-bold'
                                                          : ''
                                                      }`}
                                                    >
                                                      {subCategory.title}
                                                    </span>
                                                  )}
                                                </Link>
                                              </div>
                                            </li>
                                          )
                                        }
                                      )}
                                    </ul>
                                  </motion.div>
                                </div>
                              )}
                          </AnimatePresence> */}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      </nav>
    </>
  )
}
