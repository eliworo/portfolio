'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { NavigationImagesQueryResult } from '@/sanity.types'
import HamburgerHorizontalLine from './lines/HamburgerHorizontalLine'
import HorizontalLine from './lines/HorizontalLine'
import VerticalLine from './lines/VerticalLine'

type MobileNavigationProps = {
  navImages: NavigationImagesQueryResult
}

export default function MobileNavigation({ navImages }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const mainCategories = [
    {
      title: 'WORKS',
      slug: '/works',
      imageUrl: navImages?.works?.titleImage?.asset?.url,
      subCategories:
        navImages?.projectGroups?.map((group) => ({
          title: group.title,
          slug: `/${group.slug}`,
          imageUrl: group.titleImage?.asset?.url,
        })) ?? [],
    },
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
            className='object-contain w-18 h-auto'
          />
        ) : (
          <div className='text-3xl font-bold'>E</div>
        )}
      </Link>

      <button
        onClick={toggleMenu}
        className='fixed top-10 right-4 z-50 flex justify-center items-center w-14 h-12'
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className='relative w-12 h-12 mr-2'>
          {!isOpen ? (
            <Image
              src='/images/hamburger.png'
              alt='Open menu'
              width={600}
              height={600}
              className='absolute inset-0 m-auto object-contain h-12 w-12 -rotate-1'
            />
          ) : (
            <Image
              src='/images/close.png'
              alt='Close menu'
              width={400}
              height={400}
              className='absolute inset-0 m-auto object-contain h-12 w-12'
            />
          )}
        </div>
      </button>
      {/* <button
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
      </button> */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='fixed inset-0 z-40 bg-white/30 backdrop-blur-md flex flex-col justify-center items-center px-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className='flex items-center absolute -left-4'>
              {/* Horizontal line */}
              <HorizontalLine className='w-12' theme={{ fill: 'black' }} />

              {/* Main menu */}
              <div className='relative'>
                <ul className='flex flex-col items-start relative pl-2 w-auto'>
                  {/* Vertical line for main menu */}
                  <div className='absolute left-0 top-0 h-full'>
                    <VerticalLine
                      className='h-full'
                      theme={{ fill: 'black' }}
                    />
                  </div>

                  {mainCategories.map((category) => (
                    <li key={category.title} className='relative w-auto'>
                      <div className='flex items-center gap-0 pl-4'>
                        {category.title === 'WORKS' ? (
                          <>
                            <Link
                              href={category.slug}
                              onClick={() => setIsOpen(false)}
                              className=''
                            >
                              {category.imageUrl ? (
                                <Image
                                  src={category.imageUrl}
                                  alt={category.title}
                                  width={200}
                                  height={50}
                                  className='object-contain object-left h-auto max-h-[40px] w-auto'
                                />
                              ) : (
                                <span className='text-lg font-medium'>
                                  {category.title}
                                </span>
                              )}
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={category.slug}
                            onClick={() => setIsOpen(false)}
                            className='w-fit'
                          >
                            {category.imageUrl ? (
                              <Image
                                src={category.imageUrl}
                                alt={category.title}
                                width={200}
                                height={50}
                                className='object-contain object-left h-auto max-h-[40px]'
                              />
                            ) : (
                              <span className='text-lg font-medium'>
                                {category.title}
                              </span>
                            )}
                          </Link>
                        )}
                      </div>

                      {/* Submenu for WORKS - always visible */}
                      {category.title === 'WORKS' && (
                        <div className='flex items-start my-4 ml-2'>
                          <div className='relative'>
                            <ul className='flex flex-col space-y-3 relative ml-6 pl-3'>
                              {/* Vertical line for submenu */}
                              <div className='absolute left-0 top-0 h-full'>
                                <VerticalLine
                                  className='h-full'
                                  theme={{ fill: 'black' }}
                                />
                              </div>

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
                                        width={150}
                                        height={40}
                                        className='object-contain h-auto max-h-[40px] object-left'
                                      />
                                    ) : (
                                      <span className='text-base font-medium'>
                                        {sub.title}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
