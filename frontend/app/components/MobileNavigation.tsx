'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { NavigationImagesQueryResult } from '@/sanity.types'
import HamburgerHorizontalLine from './lines/HamburgerHorizontalLine'
import Dropdown from './drawings/Dropdown'

type MobileNavigationProps = {
  navImages: NavigationImagesQueryResult
}

export default function MobileNavigation({ navImages }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleWorks = () => setExpanded(!expanded)

  const mainCategories = [
    // {
    //   title: 'WORKS',
    //   slug: '/works',
    //   imageUrl: navImages?.works?.titleImage?.asset?.url,
    //   subCategories:
    //     navImages?.projectGroups?.map((group) => ({
    //       title: group.title,
    //       slug: `/${group.slug}`,
    //       imageUrl: group.titleImage?.asset?.url,
    //     })) ?? [],
    // },
    {
      title: 'ABOUT',
      slug: '/about',
      imageUrl: navImages?.about?.titleImage?.asset?.url,
    },
    {
      title: 'COMMISSIONS',
      slug: '/commissions',
      imageUrl: navImages?.commissions?.titleImage?.asset?.url,
    },
  ]

  return (
    <>
      <Link href='/' className='fixed top-8 left-4 z-50 block'>
        {navImages?.homepage?.logo?.asset?.url ? (
          <Image
            src={navImages.homepage.logo.asset.url}
            alt='E'
            width={200}
            height={200}
            className='object-contain w-14 h-auto'
          />
        ) : (
          <div className='text-3xl font-bold'>E</div>
        )}
      </Link>

      <button
        onClick={toggleMenu}
        className='fixed top-8 right-4 z-50 flex flex-col justify-center items-center w-14 h-12'
        aria-label='Toggle menu'
      >
        <motion.div
          className='absolute'
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 0 : -10,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <HamburgerHorizontalLine
            theme={{ fill: 'black' }}
            className='w-14 h-auto'
          />
        </motion.div>
        <motion.div
          className='absolute'
          animate={{
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <HamburgerHorizontalLine
            theme={{ fill: 'black' }}
            className='w-14 h-auto'
          />
        </motion.div>
        <motion.div
          className='absolute'
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 0 : 10,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <HamburgerHorizontalLine
            theme={{ fill: 'black' }}
            className='w-14 h-auto'
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-40 bg-white/30 backdrop-blur-md flex flex-col justify-center items-center px-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className='w-fit space-y-8'>
              {mainCategories.map((category) => (
                <div key={category.title} className='w-full'>
                  {category.title === 'WORKS' ? (
                    <>
                      {/* Works with dropdown */}
                      <div className='relative flex items-center justify-between w-[300px]'>
                        <Link
                          href={category.slug}
                          onClick={() => setIsOpen(false)}
                          className='flex-1'
                        >
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt={category.title}
                              width={300}
                              height={80}
                              className='object-contain w-full h-auto max-h-[60px]'
                            />
                          ) : (
                            <span className='text-3xl font-bold'>
                              {category.title}
                            </span>
                          )}
                        </Link>

                        <button
                          onClick={toggleWorks}
                          className='flex-shrink-0 -ml-16'
                          aria-label='Toggle project groups'
                        >
                          <Dropdown
                            className={`w-8 h-8 transition-transform duration-300 ${
                              expanded ? 'rotate-180' : ''
                            }`}
                            theme={{ fill: '#000' }}
                          />
                        </button>
                      </div>

                      {/* Project Groups Submenu */}
                      {/* <AnimatePresence>
                        {expanded && (
                          <motion.ul
                            className='mt-6 space-y-4 pl-4'
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {category.subCategories?.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={sub.slug}
                                  onClick={() => setIsOpen(false)}
                                  className='block'
                                >
                                  {sub.imageUrl ? (
                                    <Image
                                      src={sub.imageUrl}
                                      alt={sub.title || ''}
                                      width={250}
                                      height={60}
                                      className='object-contain w-full h-auto max-h-[50px] hover:opacity-80 transition-opacity'
                                    />
                                  ) : (
                                    <span className='text-2xl font-medium hover:opacity-80 transition-opacity'>
                                      {sub.title}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence> */}
                    </>
                  ) : (
                    /* Other menu items */
                    <Link
                      href={category.slug}
                      onClick={() => setIsOpen(false)}
                      className='block'
                    >
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.title}
                          width={300}
                          height={80}
                          className='object-contain w-full h-auto max-h-[60px] hover:opacity-80 transition-opacity'
                        />
                      ) : (
                        <span className='text-3xl font-bold hover:opacity-80 transition-opacity'>
                          {category.title}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
