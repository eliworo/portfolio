'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import HorizontalLine from './lines/HorizontalLine'
import VerticalLine from './lines/VerticalLine'
import { useOptimizedImagePreload } from './useOptimizedImagePreload'
import PaintedTitleImage from './PaintedTitleImage'
import { NavigationImagesQueryResult } from '@/sanity.types'

type NavigationProps = {
  navImages: NavigationImagesQueryResult
}

const NAV_HOVER_FILTER =
  'brightness(0) saturate(100%) invert(24%) sepia(99%) saturate(2529%) hue-rotate(210deg) brightness(95%) contrast(111%)'
const LOGO_ON_CLIP_PATH =
  'polygon(calc(55% - 5px) calc(36% - 5px), 100% calc(36% - 5px), 100% calc(63% + 4px), calc(55% - 5px) calc(63% + 4px), calc(55% - 5px) calc(56% + 3px), calc(63% + 2px) calc(56% + 3px), calc(63% + 2px) calc(47% - 3px), calc(55% - 5px) calc(47% - 3px))'

function buildNavStructure(navImages: NavigationProps['navImages']) {
  const mainCategories = [
    {
      title: 'WORKS',
      slug: '/works',
      subCategories:
        navImages?.projectGroups?.map((group) => ({
          title: group.title?.toUpperCase(),
          slug: `/${group.slug}`,
          titleImage: group.titleImage,
          projects:
            group.projects?.map((project) => ({
              title: project.title,
              slug: `/${group.slug}/p/${project.slug}`,
              titleImage: project.titleImage,
            })) ?? [],
        })) ?? [],
    },
    { title: 'ABOUT', slug: '/about' },
    { title: 'COMMISSIONS', slug: '/commissions' },
  ]

  return { mainCategories }
}

export default function Navigation({ navImages }: NavigationProps) {
  const navigationData = useMemo(() => buildNavStructure(navImages), [navImages])
  const navPreloadImages = useMemo(() => {
    const images: Array<{ src?: string | null; width: number; quality: number }> =
      []

    images.push({ src: navImages?.homepage?.logo?.asset?.url, width: 240, quality: 72 })
    images.push({ src: navImages?.works?.titleImage?.asset?.url, width: 360, quality: 70 })
    images.push({ src: navImages?.about?.titleImage?.asset?.url, width: 360, quality: 70 })
    images.push({
      src: navImages?.commissions?.titleImage?.asset?.url,
      width: 360,
      quality: 70,
    })

    navImages?.projectGroups?.forEach((group) => {
      images.push({ src: group.titleImage?.asset?.url, width: 360, quality: 70 })
      group.projects?.forEach((project) => {
        images.push({ src: project.titleImage?.asset?.url, width: 360, quality: 70 })
      })
    })

    return images
  }, [navImages])

  useOptimizedImagePreload(navPreloadImages, {
    width: 360,
    quality: 70,
    concurrency: 4,
    eager: true,
  })

  // states
  const [showMenu, setShowMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null,
  )

  const menuRef = useRef<HTMLDivElement>(null)

  function handleLogoHover() {
    setShowMenu(true)
  }

  function handleCloseMenu() {
    setShowMenu(false)
    setActiveCategory(null)
    setActiveSubCategory(null)
  }

  // Close menu when mouse leaves the menu area
  function handleMenuMouseLeave() {
    handleCloseMenu()
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

  function renderNavLabel({
    imageUrl,
    title,
    isActive,
  }: {
    imageUrl?: string | null
    title: string
    isActive: boolean
  }) {
    const imageStyle = {
      width: 'auto',
      maxHeight: '35px',
      filter: isActive ? NAV_HOVER_FILTER : undefined,
    }

    return (
      <span className='relative inline-block w-fit'>
        {imageUrl ? (
          <PaintedTitleImage
            src={imageUrl}
            alt={title}
            width={180}
            height={60}
            sizes='180px'
            style={imageStyle}
            className='object-contain transition-[filter] duration-150'
          />
        ) : (
          <span
            className={`text-lg font-medium transition-colors duration-150 ${
              isActive ? 'text-blue' : 'text-black'
            }`}
          >
            {title}
          </span>
        )}
      </span>
    )
  }

  return (
    <>
      {/* Blurry backdrop - now clickable to close */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className='fixed inset-0 bg-white/30 backdrop-blur-md z-40 cursor-pointer'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMenu}
          />
        )}
      </AnimatePresence>

      <nav className='fixed left-10 top-1/2 -translate-y-1/2 z-50 flex items-center'>
        <div
          ref={menuRef}
          onMouseLeave={handleMenuMouseLeave}
          className='flex items-center'
        >
          <Link
            href='/'
            className='cursor-pointer relative z-10'
            onMouseEnter={handleLogoHover}
            onFocus={handleLogoHover}
          >
            {navImages?.homepage?.logo?.asset?.url ? (
              <span className='relative block w-[115px]'>
                <Image
                  src={navImages.homepage.logo.asset.url}
                  alt='E'
                  width={115}
                  height={115}
                  quality={72}
                  sizes='115px'
                  priority
                  className='object-contain'
                />
                <Image
                  src={navImages.homepage.logo.asset.url}
                  alt=''
                  aria-hidden='true'
                  width={115}
                  height={115}
                  quality={72}
                  sizes='115px'
                  priority
                  className={`absolute inset-0 object-contain transition-opacity duration-150 ${
                    showMenu ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    clipPath: LOGO_ON_CLIP_PATH,
                    filter: NAV_HOVER_FILTER,
                  }}
                />
              </span>
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
                  <div className='py-4 -my-4 pr-8 -mr-8'>
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
                              className='group cursor-pointer'
                              onMouseEnter={() =>
                                setActiveCategory(category.title)
                              }
                            >
                              <Link
                                href={category.slug}
                                onClick={handleCloseMenu}
                                onFocus={() =>
                                  setActiveCategory(category.title)
                                }
                              >
                                {renderNavLabel({
                                  imageUrl,
                                  title: category.title,
                                  isActive: activeCategory === category.title,
                                })}
                              </Link>
                            </div>

                            {/* Subcategories */}
                            <AnimatePresence>
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
                                            return (
                                              <li
                                                key={`${category.title}-${subCategory.title}`}
                                                className='relative w-fit'
                                              >
                                                <div
                                                  className='group cursor-pointer'
                                                  onMouseEnter={() =>
                                                    setActiveSubCategory(
                                                      subCategory.title ?? null,
                                                    )
                                                  }
                                                >
                                                  <Link
                                                    href={subCategory.slug}
                                                    onClick={handleCloseMenu}
                                                    onFocus={() =>
                                                      setActiveSubCategory(
                                                        subCategory.title ??
                                                          null,
                                                      )
                                                    }
                                                  >
                                                    {renderNavLabel({
                                                      imageUrl:
                                                        subCategory.titleImage
                                                          ?.asset?.url,
                                                      title:
                                                        subCategory.title || '',
                                                      isActive:
                                                        activeSubCategory ===
                                                        subCategory.title,
                                                    })}
                                                  </Link>
                                                </div>
                                              </li>
                                            )
                                          },
                                        )}
                                      </ul>
                                    </motion.div>
                                  </div>
                                )}
                            </AnimatePresence>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  )
}
