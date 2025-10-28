'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import HorizontalLine from './lines/HorizontalLine'
import VerticalLine from './lines/VerticalLine'
import PaintBrush from './drawings/PaintBrush'
import { NavigationImagesQueryResult } from '@/sanity.types'

type NavProject = {
  title: string | null
  slug: string | null
  titleImage?: { asset?: { url?: string | null } | null } | null
  coverImage?: {
    asset?: { url?: string | null } | null
    alt?: string | null
  } | null
}

type NavProjectGroup = {
  _id: string
  title: string | null
  slug: string | null
  titleImage?: { asset?: { url?: string | null } | null } | null
  projects: NavProject[]
}

type NavImageData = {
  titleImage?: { asset?: { url?: string | null } | null } | null
}

type NavImages = {
  works?: NavImageData | null
  about?: NavImageData | null
  commissions?: NavImageData | null
  homepage?: { logo?: { asset?: { url?: string | null } | null } | null } | null
  projectGroups?: NavProjectGroup[] | null
}

type NavigationProps = {
  navImages: NavImages
}

function buildNavStructure(navImages: NavigationProps['navImages']) {
  const mainCategories = [
    {
      title: 'WORKS',
      slug: '/works',
      subCategories:
        navImages?.projectGroups?.map((group) => {
          return {
            title: group.title?.toUpperCase(),
            slug: `/works/${group.slug}`,
            titleImage: group.titleImage,
            projects:
              group.projects?.map((project: any) => {
                // THIS IS THE FIX - Create the proper URL path
                const fullSlug = `/works/${group.slug}/${project.slug}`
                console.log(`Project: ${project.title}, Slug: ${fullSlug}`)

                return {
                  title: project.title,
                  slug: fullSlug, // FIXED: Using the full path instead of just project.slug
                  titleImage: project.titleImage,
                  coverImage: project.coverImage,
                }
              }) ?? [],
          }
        }) ?? [],
    },
    { title: 'ABOUT', slug: '/about' },
    { title: 'COMMISSIONS', slug: '/commissions' },
  ]

  console.log(mainCategories[0].subCategories, 'mainCategories')

  return { mainCategories }
}

export default function Navigation({ navImages }: NavigationProps) {
  const navigationData = buildNavStructure(navImages)
  const pathname = usePathname()

  // states
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showFullNavigation, setShowFullNavigation] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null
  )

  // route-derived
  const [navLevel, setNavLevel] = useState(0)
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const [currentSubCategory, setCurrentSubCategory] = useState<string | null>(
    null
  )

  // refs/timers
  const navRef = useRef<HTMLDivElement | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const HIDE_DELAY = 150 // milliseconds — tweak if you want a longer/shorter grace

  // initialize based on route (same logic as your original but cleaned a bit)
  useEffect(() => {
    let level = 0
    let category: string | null = null
    let subCategory: string | null = null

    if (pathname === '/') {
      level = 0
    } else {
      const segments = pathname.split('/').filter(Boolean)
      const mainPath = `/${segments[0] || ''}`
      const foundCategory = navigationData.mainCategories.find(
        (c) => c.slug === mainPath
      )

      if (foundCategory) {
        level = 1
        category = foundCategory.title

        if (segments.length > 1 && foundCategory.subCategories) {
          const subPath = `/${segments[0]}/${segments[1]}`
          const foundSub = foundCategory.subCategories.find(
            (s) => s.slug === subPath
          )
          if (foundSub) {
            level = 2
            subCategory = foundSub.title || null

            if (segments.length > 2) {
              level = 3
            }
          }
        }
      }
    }

    setNavLevel(level)
    setCurrentCategory(category)
    setCurrentSubCategory(subCategory)

    // keep the visible/menu states consistent with route
    setShowMainMenu(false)
    setShowFullNavigation(false)
    setActiveCategory(null)
    setActiveSubCategory(null)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // clear hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
    }
  }, [])

  // small animation variants (kept minimal)
  const menuVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.24 } },
  }
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.28 } },
  }

  const fullNavVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  }

  const currentCategoryData =
    navLevel >= 1
      ? navigationData.mainCategories.find(
          (cat) => cat.title === currentCategory
        )
      : null

  // Show blur ONLY when the entire nav (previous levels) is visible — NOT when just projects column is open
  const showBlur =
    (navLevel === 0 && showMainMenu) || (navLevel >= 1 && showFullNavigation)

  // --- Hover helpers ---
  function clearHoverTimeout() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  function hideAllDelayed() {
    clearHoverTimeout()
    hoverTimeoutRef.current = setTimeout(() => {
      setShowMainMenu(false)
      setShowFullNavigation(false)
      setActiveCategory(null)
      setActiveSubCategory(null)
    }, HIDE_DELAY)
  }

  // Called when entering the nav wrapper
  function handleWrapperEnter() {
    clearHoverTimeout()
    if (navLevel === 0) {
      setShowMainMenu(true)
    }
    // on category pages we DO NOT auto-show the left columns — only the left-line should do that
  }

  function handleWrapperLeave() {
    hideAllDelayed()
  }

  // Left-line / full-nav hover handlers (these are the only ones that control showing the "full" tree)
  function showFullNavNow() {
    clearHoverTimeout()
    setShowFullNavigation(true)
  }

  function hideFullNavDelayed() {
    clearHoverTimeout()
    hoverTimeoutRef.current = setTimeout(() => {
      setShowFullNavigation(false)
    }, HIDE_DELAY)
  }

  const navPositionClass =
    navLevel === 0
      ? 'fixed left-10 top-1/2 -translate-y-1/2 z-50 flex items-center'
      : 'fixed -left-2 top-1/2 -translate-y-1/2 z-50 flex items-center'

  return (
    <>
      {/* Blurry backdrop */}
      <AnimatePresence>
        {showBlur && (
          <motion.div
            className='fixed inset-0 bg-white/30 backdrop-blur-md z-40 pointer-events-none'
            variants={backdropVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
          />
        )}
      </AnimatePresence>

      <nav
        ref={navRef}
        onMouseEnter={handleWrapperEnter}
        onMouseLeave={handleWrapperLeave}
        onFocus={handleWrapperEnter}
        onBlur={handleWrapperLeave}
        className={navPositionClass}
      >
        {/* HOMEPAGE NAV (level 0) */}
        {navLevel === 0 && (
          <>
            <div className='cursor-pointer relative z-10'>
              {navImages?.homepage?.logo?.asset?.url ? (
                <Image
                  src={navImages.homepage.logo.asset.url}
                  alt='E'
                  width={100}
                  height={100}
                  className='object-contain'
                />
              ) : (
                <div className='text-6xl font-bold'>E</div>
              )}
            </div>

            <AnimatePresence>
              {showMainMenu && (
                <div className='flex items-center ml-2'>
                  {/* <div className='px-3 py-2 -mx-3'>
                    <div className='w-6 h-[1px] bg-black' />
                  </div> */}
                  <div className='px-3 py-2 -mx-3 flex items-center'>
                    {/* <HandwrittenLine
                      direction='horizontal'
                      className='w-8 h-3'
                    /> */}
                    <HorizontalLine
                      className='w-10'
                      theme={{ fill: 'black' }}
                    />
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
                        // Get the image URL based on category title

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
                          <li key={category.title} className='relative'>
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
                                      maxHeight: '30px',
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
                            <AnimatePresence>
                              {activeCategory === category.title &&
                                category.subCategories &&
                                category.subCategories.length > 0 && (
                                  <div className='flex items-center absolute left-full top-1/2 -translate-y-1/2'>
                                    {/* <div className='px-3 py-2 -mx-3'>
                                      <div className='w-6 h-[1px] bg-black' />
                                    </div> */}
                                    <HorizontalLine
                                      className='w-10'
                                      theme={{ fill: 'black' }}
                                    />

                                    <motion.div
                                      className='relative'
                                      variants={menuVariants}
                                      initial='hidden'
                                      animate='visible'
                                      exit='hidden'
                                    >
                                      <ul className='flex flex-col space-y-3 pl-4'>
                                        <div className='absolute left-0 top-0 h-full'>
                                          <VerticalLine
                                            className='h-full'
                                            theme={{ fill: 'black' }}
                                          />
                                        </div>
                                        {category.subCategories.map(
                                          (subCategory) => {
                                            const hasImage =
                                              subCategory?.titleImage?.asset
                                                ?.url

                                            return (
                                              <li
                                                key={subCategory.title}
                                                className='relative'
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
                                                      <div className='relative w-[180px] h-[30px]'>
                                                        <Image
                                                          src={
                                                            subCategory
                                                              .titleImage?.asset
                                                              ?.url || ''
                                                          }
                                                          alt={
                                                            subCategory.title ||
                                                            ''
                                                          }
                                                          fill
                                                          style={{
                                                            objectPosition:
                                                              'left center', // Left alignment
                                                          }}
                                                          className='object-contain'
                                                        />
                                                      </div>
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

                                                {/* Third level (projects) */}
                                                <AnimatePresence>
                                                  {activeSubCategory ===
                                                    subCategory.title &&
                                                    subCategory.projects &&
                                                    subCategory.projects
                                                      .length > 0 && (
                                                      <div className='flex items-center absolute left-full top-1/2 -translate-y-1/2'>
                                                        <div className='px-3 py-2 -mx-3'>
                                                          {/* <div className='w-6 h-[1px] bg-black' /> */}
                                                          <HorizontalLine
                                                            className='w-12'
                                                            theme={{
                                                              fill: 'black',
                                                            }}
                                                          />
                                                        </div>

                                                        <motion.div
                                                          className='relative'
                                                          variants={
                                                            menuVariants
                                                          }
                                                          initial='hidden'
                                                          animate='visible'
                                                          exit='hidden'
                                                        >
                                                          <ul className='flex flex-col space-y-3 pl-4 h-full'>
                                                            <div className='absolute left-0 top-0 h-full'>
                                                              <VerticalLine
                                                                className='h-full'
                                                                theme={{
                                                                  fill: 'black',
                                                                }}
                                                              />
                                                            </div>
                                                            {subCategory.projects.map(
                                                              (project) => {
                                                                const hasProjectImage =
                                                                  project
                                                                    .titleImage
                                                                    ?.asset?.url

                                                                console.log(
                                                                  project,
                                                                  'project'
                                                                )
                                                                console.log(
                                                                  hasProjectImage,
                                                                  'hasPRojectImage???'
                                                                )

                                                                return (
                                                                  <li
                                                                    key={
                                                                      project.title
                                                                    }
                                                                    className='group'
                                                                  >
                                                                    <Link
                                                                      href={
                                                                        project.slug
                                                                      }
                                                                      className='block text-black hover:text-gray-600 transition-colors'
                                                                    >
                                                                      {hasProjectImage ? (
                                                                        <div className='relative w-[180px] h-[30px]'>
                                                                          <Image
                                                                            src={
                                                                              project
                                                                                .titleImage
                                                                                .asset
                                                                                .url
                                                                            }
                                                                            alt={
                                                                              project.title
                                                                            }
                                                                            fill
                                                                            style={{
                                                                              objectPosition:
                                                                                'left center', // Left alignment
                                                                            }}
                                                                            className='object-contain'
                                                                          />
                                                                        </div>
                                                                      ) : (
                                                                        <span className='group-hover:underline'>
                                                                          {
                                                                            project.title
                                                                          }
                                                                        </span>
                                                                      )}
                                                                    </Link>
                                                                  </li>
                                                                )
                                                              }
                                                            )}
                                                          </ul>
                                                        </motion.div>
                                                      </div>
                                                    )}
                                                </AnimatePresence>
                                              </li>
                                            )
                                          }
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
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* CATEGORY PAGES NAV (navLevel >= 1) */}
        {navLevel >= 1 && currentCategoryData && (
          <>
            {/* Previous levels section - shows based on navLevel */}
            <AnimatePresence>
              {showFullNavigation && (
                <motion.div
                  key='full-nav'
                  className='flex items-center'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  onMouseEnter={showFullNavNow}
                  onMouseLeave={hideFullNavDelayed}
                >
                  {/* Logo */}
                  <motion.div className='cursor-pointer relative z-10 ml-6'>
                    {navImages?.homepage?.logo?.asset?.url ? (
                      <Link href='/'>
                        <Image
                          src={navImages.homepage.logo.asset.url}
                          alt='E'
                          width={60}
                          height={80}
                          style={{
                            width: 'auto',
                            maxHeight: '80px',
                          }}
                          className='object-contain'
                        />
                      </Link>
                    ) : (
                      <Link href='/' className='text-6xl font-bold'>
                        E
                      </Link>
                    )}
                  </motion.div>

                  {/* Categories column */}
                  <div className='flex items-center ml-2'>
                    <div className='px-3 py-2 -mx-3'>
                      <HorizontalLine
                        className='w-10'
                        theme={{ fill: 'black' }}
                      />
                    </div>

                    <motion.div className='relative'>
                      <ul className='flex flex-col space-y-3 pl-4 relative'>
                        <div className='absolute left-0 top-0 h-full'>
                          <VerticalLine
                            className='h-full'
                            theme={{ fill: 'black' }}
                          />
                        </div>
                        {navigationData.mainCategories.map((category) => {
                          // Get image URL based on category
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
                            imageUrl =
                              navImages.commissions.titleImage.asset.url
                          }

                          return (
                            <li key={category.title}>
                              <div
                                className={`cursor-pointer hover:opacity-90 transition-opacity ${
                                  currentCategory === category.title
                                    ? 'font-bold'
                                    : ''
                                }`}
                              >
                                <Link href={category.slug}>
                                  {imageUrl ? (
                                    <Image
                                      src={imageUrl}
                                      alt={category.title}
                                      width={120}
                                      height={40}
                                      style={{
                                        width: 'auto',
                                        maxHeight: '30px',
                                      }}
                                      className='object-contain'
                                    />
                                  ) : (
                                    <span className='text-lg font-medium'>
                                      {category.title}
                                    </span>
                                  )}
                                </Link>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </motion.div>
                  </div>

                  {/* Subcategories column - only show if we're on subcategory page or deeper */}
                  {navLevel >= 2 && currentCategoryData.subCategories && (
                    <div className='flex items-center ml-2'>
                      <div className='px-3 py-2 -mx-3'>
                        <HorizontalLine
                          className='w-10'
                          theme={{ fill: 'black' }}
                        />
                      </div>

                      <motion.div className='relative'>
                        <ul className='flex flex-col space-y-3 pl-4 relative'>
                          <div className='absolute left-0 top-0 h-full'>
                            <VerticalLine
                              className='h-full'
                              theme={{ fill: 'black' }}
                            />
                          </div>
                          {currentCategoryData.subCategories.map(
                            (subCategory) => {
                              const hasImage =
                                subCategory?.titleImage?.asset?.url
                              const isCurrentSub =
                                currentSubCategory === subCategory.title
                              return (
                                <li
                                  key={subCategory.title}
                                  className='relative'
                                >
                                  <div
                                    className={`cursor-pointer hover:opacity-90 transition-opacity ${
                                      isCurrentSub ? 'font-bold' : ''
                                    }`}
                                  >
                                    <Link href={subCategory.slug}>
                                      {hasImage ? (
                                        <Image
                                          src={
                                            subCategory.titleImage?.asset
                                              ?.url || ''
                                          }
                                          alt={subCategory.title || ''}
                                          width={180}
                                          height={50}
                                          style={{
                                            width: 'auto',
                                            maxHeight: '35px',
                                          }}
                                          className='object-contain'
                                        />
                                      ) : (
                                        <span className='text-lg font-medium'>
                                          {subCategory.title}
                                        </span>
                                      )}
                                    </Link>
                                  </div>

                                  {/* Show projects connected to current subcategory */}
                                  {isCurrentSub &&
                                    subCategory.projects &&
                                    subCategory.projects.length > 0 && (
                                      <div className='flex items-center absolute left-full top-1/2 -translate-y-1/2'>
                                        <div className='px-3 py-2 -mx-3'>
                                          <HorizontalLine
                                            className='w-12'
                                            theme={{ fill: 'black' }}
                                          />
                                        </div>

                                        <div className='relative'>
                                          <ul className='flex flex-col space-y-3 pl-4 relative'>
                                            <div className='absolute left-0 top-0 h-full'>
                                              <VerticalLine
                                                className='h-full'
                                                theme={{ fill: 'black' }}
                                              />
                                            </div>
                                            {subCategory.projects.map(
                                              (project) => {
                                                const hasProjectImage =
                                                  project.titleImage?.asset?.url

                                                return (
                                                  <li key={project.title}>
                                                    <Link
                                                      href={project.slug}
                                                      className='text-base text-black hover:text-gray-600 transition-colors'
                                                    >
                                                      {hasProjectImage ? (
                                                        <div className='relative w-[180px] h-[30px]'>
                                                          <Image
                                                            src={
                                                              project.titleImage
                                                                .asset.url
                                                            }
                                                            alt={project.title}
                                                            fill
                                                            style={{
                                                              objectPosition:
                                                                'left center',
                                                            }}
                                                            className='object-contain'
                                                          />
                                                        </div>
                                                      ) : (
                                                        project.title
                                                      )}
                                                    </Link>
                                                  </li>
                                                )
                                              }
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                </li>
                              )
                            }
                          )}
                        </ul>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default visible part for category pages (navLevel 1) */}
            {navLevel === 1 && (
              <div
                className={`flex items-center ${showFullNavigation ? 'ml-8' : ''}`}
              >
                {/* LEFT-LINE HITBOX */}
                <div
                  className='px-3 py-2 -mx-3 cursor-pointer'
                  onMouseEnter={showFullNavNow}
                  onMouseLeave={hideFullNavDelayed}
                >
                  <HorizontalLine className='w-10' theme={{ fill: 'black' }} />
                </div>

                {/* Always-visible subcategory list on category pages */}
                <div className='relative'>
                  <ul className='flex flex-col space-y-3 pl-4 relative'>
                    <div className='absolute left-0 top-0 h-full'>
                      <VerticalLine
                        className='h-full'
                        theme={{ fill: 'black' }}
                      />
                    </div>
                    {currentCategoryData.subCategories?.map((subCategory) => {
                      const hasImage = subCategory?.titleImage?.asset?.url
                      return (
                        <li
                          key={subCategory.title}
                          className='relative'
                          onMouseEnter={() =>
                            setActiveSubCategory(subCategory.title ?? null)
                          }
                          onMouseLeave={() => setActiveSubCategory(null)}
                        >
                          <div
                            className={`cursor-pointer hover:opacity-90 transition-opacity`}
                          >
                            <Link href={subCategory.slug}>
                              {hasImage ? (
                                <Image
                                  src={subCategory.titleImage?.asset?.url || ''}
                                  alt={subCategory.title || ''}
                                  width={180}
                                  height={50}
                                  style={{
                                    width: 'auto',
                                    maxHeight: '40px',
                                  }}
                                  className={`object-contain ${
                                    currentSubCategory === subCategory.title ||
                                    activeSubCategory === subCategory.title
                                      ? 'opacity-100'
                                      : 'opacity-90'
                                  }`}
                                />
                              ) : (
                                <span
                                  className={`text-lg font-medium ${
                                    currentSubCategory === subCategory.title ||
                                    activeSubCategory === subCategory.title
                                      ? 'font-bold'
                                      : ''
                                  }`}
                                >
                                  {subCategory.title}
                                </span>
                              )}
                            </Link>
                          </div>

                          <AnimatePresence>
                            {activeSubCategory === subCategory.title &&
                              subCategory.projects &&
                              subCategory.projects.length > 0 && (
                                <div className='flex items-center absolute left-full top-1/2 -translate-y-1/2'>
                                  <div className='px-3 py-2 -mx-3'>
                                    <HorizontalLine
                                      className='w-12'
                                      theme={{ fill: 'black' }}
                                    />
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
                                      {subCategory.projects.map((project) => {
                                        const hasProjectImage =
                                          project.titleImage?.asset?.url

                                        return (
                                          <li key={project.title}>
                                            <Link
                                              href={project.slug}
                                              className='text-base text-black hover:text-gray-600 transition-colors'
                                            >
                                              {hasProjectImage ? (
                                                <div className='relative w-[180px] h-[30px]'>
                                                  <Image
                                                    src={
                                                      project.titleImage.asset
                                                        .url
                                                    }
                                                    alt={project.title}
                                                    fill
                                                    style={{
                                                      objectPosition:
                                                        'left center',
                                                    }}
                                                    className='object-contain'
                                                  />
                                                </div>
                                              ) : (
                                                project.title
                                              )}
                                            </Link>
                                          </li>
                                        )
                                      })}
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
              </div>
            )}

            {/* Subcategory pages (navLevel >= 2) - Show PROJECTS by default */}
            {navLevel >= 2 &&
              currentSubCategory &&
              !showFullNavigation &&
              (() => {
                const currentSubCategoryData =
                  currentCategoryData.subCategories?.find(
                    (sub) => sub.title === currentSubCategory
                  )
                return currentSubCategoryData?.projects &&
                  currentSubCategoryData.projects.length > 0 ? (
                  <div className='flex items-center'>
                    {/* LEFT-LINE HITBOX */}
                    <div
                      className='px-3 py-2 -mx-3 cursor-pointer'
                      onMouseEnter={showFullNavNow}
                      onMouseLeave={hideFullNavDelayed}
                    >
                      <HorizontalLine
                        className='w-10'
                        theme={{ fill: 'black' }}
                      />
                    </div>

                    {/* Show PROJECTS list by default */}
                    <div className='relative'>
                      <ul className='flex flex-col -space-y-2 pl-4 relative'>
                        <div className='absolute left-0 top-0 h-full'>
                          <VerticalLine
                            className='h-full'
                            theme={{ fill: 'black' }}
                          />
                        </div>
                        {currentSubCategoryData.projects.map((project) => {
                          const hasProjectImage = project.titleImage?.asset?.url
                          const isCurrentProject = pathname.includes(
                            project.slug
                          )

                          return (
                            <li key={project.title}>
                              <Link
                                href={project.slug}
                                className='text-base text-black hover:text-gray-600 transition-colors'
                              >
                                {hasProjectImage ? (
                                  <div
                                    className={`inline-flex items-center relative w-fit h-full`}
                                  >
                                    {isCurrentProject && (
                                      <PaintBrush
                                        theme={{ fill: '#9AB1FF' }} // Tailwind yellow-300 hex
                                        className='absolute left-0 top-0 w-[140%] h-full -z-10 -ml-1'
                                      />
                                    )}
                                    <Image
                                      src={project.titleImage.asset.url}
                                      alt={project.title}
                                      height={100}
                                      width={150}
                                      style={{
                                        height: 40,
                                        width: 'auto',
                                        objectFit: 'contain',
                                        objectPosition: 'left center',
                                      }}
                                      className='object-contain'
                                    />
                                  </div>
                                ) : (
                                  project.title
                                )}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                ) : null
              })()}
          </>
        )}
      </nav>
    </>
  )
}
