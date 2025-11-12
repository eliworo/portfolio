'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PaintBrush from './drawings/PaintBrush'
import ProjectModal from './ProjectModal'
import CategoryNav from './CategoryNav'

// Sanitization helpers
const stripInvisible = (s?: string) =>
  (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '').trim()

const cleanAlt = (alt: string | undefined, fallback: string) => {
  const cleaned = stripInvisible(alt)
  return cleaned.length > 0 ? cleaned : fallback
}

const normalizeCategoryKey = (key: string) =>
  stripInvisible(key).substring(0, 12)

type FeaturedProject = {
  _key: string
  offsetY?: number
  offsetX?: number
  rotation?: number
  scale?: number
  zIndex?: number
  categorySectionKey?: string
  project: {
    _id: string
    title: string
    slug: string
    projectKind: 'professional' | 'personal'
    projectTypeSlug?: string
    titleImage?: { asset?: { url?: string } }
    coverImage?: { asset?: { url?: string }; alt?: string }
    description?: string
    content?: any[]
    categories?: Array<{
      _id: string
      title: string
      slug: { current: string }
      titleImage?: { asset?: { url?: string } }
    }>
    categorySections?: Array<{
      _key: string
      category: {
        _id: string
        title: string
        slug: string
        titleImage?: { asset?: { url?: string } }
      }
      preview?: {
        _type: 'image' | 'text'
        image?: { asset?: { url?: string }; alt?: string }
        text?: string
      }
      content?: any[]
    }>
  }
}

export default function CreativeProjectsList({
  featuredProjects,
  groupSlug,
  groupTitleImageUrl,
  groupTitle,
  initialCategory,
}: {
  featuredProjects: FeaturedProject[]
  groupSlug: string
  groupTitleImageUrl?: string
  groupTitle?: string
  initialCategory?: string
}) {
  const [modalProject, setModalProject] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  )
  const kindOf = (p: any) => String(p?.projectKind ?? '').toLowerCase()
  const isPersonalKind = (p: any) => kindOf(p).includes('personal')
  const isProfessionalKind = (p: any) => kindOf(p).includes('professional')

  console.log('featured projects', featuredProjects)

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const coverForItem = (item: FeaturedProject) => {
    const p = item.project
    if (!p) return undefined
    if (isPersonalKind(p)) return p.coverImage?.asset?.url

    // professional
    if (item.categorySectionKey && p.categorySections?.length) {
      const coreKey = normalizeCategoryKey(item.categorySectionKey)
      const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))

      console.log(
        'Professional item:',
        item._key,
        'categorySectionKey (core):',
        coreKey,
        'section found:',
        sec ? 'yes' : 'no',
        'preview image:',
        sec?.preview?.image?.asset?.url
      )

      if (sec?.preview?.image?.asset?.url) {
        return sec.preview.image.asset.url
      }
      if (sec?.content) {
        for (const block of sec.content) {
          if (
            (block?._type === 'imageBlock' ||
              block?._type === 'imageGallery') &&
            block?.images?.length
          ) {
            const url = block.images[0]?.asset?.url
            if (url) return url
          }
        }
      }
      return undefined
    }

    return p.coverImage?.asset?.url
  }

  const hrefFor = (item: FeaturedProject) => {
    const p = item.project
    if (!p) return '#'
    const projectTypeSlug = p.projectTypeSlug || groupSlug

    if (isProfessionalKind(p)) {
      let url = `/${projectTypeSlug}/${p.slug}`
      if (item.categorySectionKey && p.categorySections) {
        const coreKey = normalizeCategoryKey(item.categorySectionKey)
        const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))
        if (sec?.category?.slug) {
          url += `#${sec.category.slug}`
        }
      }
      return url
    }

    return '#'
  }

  const brushColor = (i: number) =>
    ['#FFB6C1', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8B88B'][i % 5]

  const allCategories = Array.from(
    new Map(
      featuredProjects
        .filter((item) => item?.project)
        .flatMap((item) => {
          const categories = []

          if (item.categorySectionKey && isProfessionalKind(item.project)) {
            const coreKey = normalizeCategoryKey(item.categorySectionKey)
            const sec = item.project.categorySections?.find((s) =>
              s._key.startsWith(coreKey)
            )
            if (sec) {
              categories.push([
                sec.category.slug,
                {
                  id: sec.category.slug,
                  title: sec.category.title,
                  titleImageUrl: sec.category.titleImage?.asset?.url,
                },
              ])
            }
          }

          if (isPersonalKind(item.project) && item.project.categories) {
            item.project.categories.forEach((cat) => {
              categories.push([
                cat.slug.current,
                {
                  id: cat.slug.current,
                  title: cat.title,
                  titleImageUrl: cat.titleImage?.asset?.url,
                },
              ])
            })
          }

          return categories
        })
        .filter(Boolean) as [string, any][]
    ).values()
  )

  const filteredProjects = selectedCategory
    ? featuredProjects.filter((item) => {
        if (!item?.project) return false

        if (isPersonalKind(item.project)) {
          return item.project.categories?.some(
            (cat) => cat.slug.current === selectedCategory
          )
        }

        if (item.categorySectionKey && item.project.categorySections) {
          const coreKey = normalizeCategoryKey(item.categorySectionKey)
          const sec = item.project.categorySections.find((s) =>
            s._key.startsWith(coreKey)
          )
          return sec?.category?.slug === selectedCategory
        }

        return false
      })
    : featuredProjects

  const handleSelectCategory = (id: string | null) => {
    try {
      const url = new URL(window.location.href)
      if (id) url.searchParams.set('category', id)
      else url.searchParams.delete('category')
      window.history.replaceState({}, '', url.toString())
    } catch {}

    setSelectedCategory(selectedCategory === id ? null : id)
  }

  const currentCategory = selectedCategory
    ? allCategories.find((c) => c.id === selectedCategory)
    : null

  if (!featuredProjects?.length) {
    return (
      <div className='py-12 text-center text-gray-500'>
        No curated projects yet.
      </div>
    )
  }

  return (
    <>
      {allCategories.length > 0 && (
        <CategoryNav
          items={allCategories}
          title='woronoff by category'
          isStudioWorks={true}
          groupSlug={groupSlug}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />
      )}

      <div className='px-4 lg:px-0 lg:mb-8 fixed -rotate-3 lg:rotate-0 left-0 lg:left-22 top-23 lg:top-16 z-20 w-full lg:w-[40vw]'>
        <AnimatePresence mode='wait'>
          {currentCategory?.titleImageUrl ? (
            <motion.div
              key={`category-${currentCategory.id}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={currentCategory.titleImageUrl}
                alt={currentCategory.title}
                width={600}
                height={200}
                className='object-contain h-auto'
              />
            </motion.div>
          ) : groupTitleImageUrl ? (
            <motion.div
              key='group-title'
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={groupTitleImageUrl}
                alt={groupTitle || 'Project Group Title'}
                width={600}
                height={200}
                className='object-contain h-auto'
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className='columns-[180px] lg:columns-[400px] gap-2 py-40 lg:py-64'>
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((item, idx) => {
            if (!item?.project) return null
            const img = coverForItem(item)
            if (!img) return null

            const isPersonal = isPersonalKind(item.project)
            const onClick = (e: React.MouseEvent) => {
              if (isPersonal) {
                e.preventDefault()
                setModalProject({
                  title: item.project.title,
                  titleImageUrl: item.project.titleImage?.asset?.url,
                  coverImageUrl: img,
                  description: item.project.description,
                  content: item.project.content,
                })
              }
            }

            // Debug transform
            console.log(`Item ${item._key} offsets:`, {
              offsetX: item.offsetX,
              offsetY: item.offsetY,
              rotation: item.rotation,
              scale: item.scale,
            })

            const transformValue = `translate(${Number(item.offsetX ?? 0)}px, ${Number(item.offsetY ?? 0)}px) rotate(${Number(item.rotation ?? 0)}deg) scale(${Number(item.scale ?? 1)})`
            console.log(`Transform for ${item._key}:`, transformValue)

            return (
              <motion.div
                key={item._key}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  x: item.offsetX ?? 0,
                  y: item.offsetY ?? 0,
                  rotate: item.rotation ?? 0,
                  scale: item.scale ?? 1,
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                className='relative mb-2 break-inside-avoid cursor-pointer'
                style={{
                  zIndex: item.zIndex || 0,
                }}
                onClick={onClick}
              >
                <Link href={hrefFor(item)} className='block relative'>
                  <Image
                    src={img}
                    alt={cleanAlt(
                      item.project.coverImage?.alt,
                      item.project.title
                    )}
                    width={300}
                    height={400}
                    className='w-full h-auto object-cover'
                  />

                  {item.project.titleImage?.asset?.url && (
                    <div className='absolute top-4 left-4 z-10'>
                      <div className='relative'>
                        <PaintBrush
                          className='absolute inset-0 w-full h-full -z-10'
                          theme={{ fill: brushColor(idx) }}
                        />
                        <div className='px-3 py-2'>
                          <Image
                            src={item.project.titleImage.asset.url}
                            alt={item.project.title}
                            width={100}
                            height={30}
                            className='object-contain h-6 w-auto'
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <ProjectModal
        project={modalProject}
        onClose={() => setModalProject(null)}
      />
    </>
  )
}
