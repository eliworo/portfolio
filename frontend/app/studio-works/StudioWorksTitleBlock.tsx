'use client'

import React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'

export default function StudioWorksTitleBlock({
  groupTitleImageUrl,
  groupTitle,
  currentCategory,
}: {
  groupTitleImageUrl?: string
  groupTitle?: string
  currentCategory?: { id: string; title: string; titleImageUrl?: string } | null
}) {
  const img = currentCategory?.titleImageUrl || groupTitleImageUrl
  const alt = currentCategory?.title || groupTitle || 'Studio Works'

  if (!img) return null

  return (
    <div className='px-4 lg:px-0'>
      <div
        className='
          relative
          w-[85vw] lg:w-[40vw]
          max-w-[600px]
          mx-auto lg:mx-0
          lg:ml-22
          mt-8 lg:mt-16
        '
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentCategory?.id || 'group-title'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className='origin-left -rotate-3 lg:rotate-0'
          >
            <Image
              src={img}
              alt={alt}
              width={1000}
              height={300}
              className='object-contain h-auto w-auto max-h-[140px] lg:max-h-[150px]'
              priority
              sizes='(max-width: 1024px) 85vw, 40vw'
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
