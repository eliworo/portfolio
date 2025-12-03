'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PaintBrush from './drawings/PaintBrush'
import ProjectModal from './ProjectModal'
import CategoryNav from './CategoryNav'
import CoverImage from './CoverImage'
import { urlForImage } from '@/sanity/lib/utils'

const stripInvisible = (s?: string) =>
  (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '').trim()

const cleanAlt = (alt: string | undefined, fallback: string) => {
  const cleaned = stripInvisible(alt)
  return cleaned.length > 0 ? cleaned : fallback
}

const normalizeCategoryKey = (key: string) =>
  stripInvisible(key).substring(0, 12)

type SanityImageAsset = {
  _ref?: string
  _id?: string
  _type?: string
  url?: string
}

type SanityImageSource = {
  asset?: SanityImageAsset
  crop?: Record<string, number>
  hotspot?: Record<string, number>
  alt?: string
  [key: string]: any
}

const hasImageAsset = (image?: SanityImageSource) =>
  Boolean(
    image?.asset &&
      (image.asset._ref || image.asset._id || image.asset._type === 'reference')
  )

const normalizeImageSource = (image?: SanityImageSource) => {
  if (!image?.asset) return undefined
  if (image.asset._ref) return image
  if (image.asset._id) {
    return {
      ...image,
      asset: { _ref: image.asset._id },
    }
  }
  return undefined
}

const buildImageUrl = (image?: SanityImageSource, width = 1400) => {
  const normalized = normalizeImageSource(image)
  if (!normalized) return image?.asset?.url
  return (
    urlForImage(normalized)?.width(width).quality(85).url() || image?.asset?.url
  )
}

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
    slug: { current: string }
    projectKind: 'professional' | 'personal'
    projectSize?: 'small' | 'large'
    projectSubtype?: 'artwork' | 'writing'
    projectTypeSlug?: string
    titleImage?: { asset?: { url?: string } }
    coverImage?: SanityImageSource
    images?: Array<SanityImageSource & { title?: string }>
    description?: string
    year?: string
    content?: any[]
    previewType?: 'image' | 'text'
    textExtractIndex?: number
    writingContent?: Array<{
      _type: string
      _key: string
      content?: string
      image?: { asset?: { url?: string }; alt?: string }
      caption?: string
    }>
    categories?: Array<{
      _id: string
      title: string
      slug: { current: string }
      titleImage?: { asset?: { url?: string } }
    }>
    writingLayout?: 'single' | 'double'
    categorySections?: Array<{
      _key: string
      category: {
        _id: string
        title: string
        slug: { current: string }
        titleImage?: { asset?: { url?: string } }
      }
      preview?: {
        mode?: 'image' | 'text'
        _type?: 'image' | 'text'
        image?: SanityImageSource
        text?: string
        textOverride?: string
        textExtractIndex?: number
      }
      content?: any[]
    }>
  }
}

type PreviewResult =
  | { type: 'image'; image?: SanityImageSource }
  | { type: 'text'; content: string }

const kindOf = (p: any) => String(p?.projectKind ?? '').toLowerCase()
const isPersonalKind = (p: any) => kindOf(p).includes('personal')
const isProfessionalKind = (p: any) => kindOf(p).includes('professional')

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768)
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const hrefFor = (item: FeaturedProject) => {
    const p = item.project
    if (!p) return '#'

    if (isProfessionalKind(p)) {
      let url = `/productions/${p.slug.current}`
      if (item.categorySectionKey && p.categorySections) {
        const coreKey = normalizeCategoryKey(item.categorySectionKey)
        const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))
        if (sec?.category?.slug?.current) url += `#${sec.category.slug.current}`
      }
      return url
    }

    if (isPersonalKind(p) && p.projectSize === 'large' && p.slug?.current) {
      return `/studio-works/${p.slug.current}`
    }

    return '#'
  }

  const brushColor = (i: number) =>
    ['#FFB6C1', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8B88B'][i % 5]

  const allCategories = useMemo(() => {
    const pairs: [string, any][] = featuredProjects
      .filter((item) => item?.project)
      .flatMap((item) => {
        const categories: [string, any][] = []

        if (item.categorySectionKey && isProfessionalKind(item.project)) {
          const coreKey = normalizeCategoryKey(item.categorySectionKey)
          const sec = item.project.categorySections?.find((s) =>
            s._key.startsWith(coreKey)
          )
          if (sec) {
            categories.push([
              sec.category.slug.current,
              {
                id: sec.category.slug.current,
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

    return Array.from(new Map(pairs).values())
  }, [featuredProjects])

  const filteredProjects = useMemo(() => {
    if (!selectedCategory) return featuredProjects

    return featuredProjects.filter((item) => {
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
        return sec?.category?.slug?.current === selectedCategory
      }

      return false
    })
  }, [featuredProjects, selectedCategory])

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

  const portableTextToPlain = (content: any): string => {
    if (!content) return ''
    if (typeof content === 'string') return content
    if (!Array.isArray(content)) return ''
    return content
      .map((block: any) =>
        Array.isArray(block?.children)
          ? block.children.map((child: any) => child?.text || '').join('')
          : block?.text || ''
      )
      .join('\n')
      .replace(/\s+\n/g, '\n')
      .trim()
  }

  const getSectionTextExtract = (section: any, index?: number) => {
    if (!section?.content) return undefined
    // Look for both textBlock and textWithImage
    const textBlocks = section.content.filter(
      (block: any) =>
        block?._type === 'textBlock' || block?._type === 'textWithImage'
    )
    if (!textBlocks.length) return undefined
    const idx = Math.max(0, (index ?? 1) - 1)
    const target = textBlocks[idx] || textBlocks[textBlocks.length - 1]
    // textBlock uses 'content', textWithImage uses 'text'
    const content = target.content || target.text
    const plain = portableTextToPlain(content)
    return plain || undefined
  }

  const coverOrPreviewForItem = (item: FeaturedProject): PreviewResult => {
    const p = item.project
    if (!p) return { type: 'image', image: undefined }

    console.debug('coverOrPreviewForItem start', {
      key: item._key,
      title: p.title,
      kind: p.projectKind,
      size: p.projectSize,
      categorySectionKey: item.categorySectionKey,
      previewFromProject: {
        previewType: p.previewType,
        textExtractIndex: p.textExtractIndex,
      },
    })

    // Small personal writing projects
    if (isPersonalKind(p) && p.projectSubtype === 'writing') {
      if (p.previewType === 'text' && p.writingContent && p.textExtractIndex) {
        const textBlocks = p.writingContent.filter(
          (block) => block._type === 'writingTextBlock'
        )
        const selectedBlock = textBlocks[p.textExtractIndex - 1]
        if (selectedBlock?.content) {
          return { type: 'text', content: selectedBlock.content }
        }
      }
      if (p.coverImage) return { type: 'image', image: p.coverImage }
      return { type: 'text', content: 'No preview available' }
    }

    // Small personal artwork projects
    if (isPersonalKind(p) && p.projectSize !== 'large') {
      return { type: 'image', image: p.coverImage }
    }

    // Professional or Large Personal projects (using Category Sections)
    if (
      (isProfessionalKind(p) || p.projectSize === 'large') &&
      item.categorySectionKey &&
      p.categorySections?.length
    ) {
      const coreKey = normalizeCategoryKey(item.categorySectionKey)
      const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))

      if (!sec) return { type: 'image', image: p.coverImage }

      console.debug('section data', {
        sectionKey: sec?._key,
        preview: sec?.preview,
        content: sec?.content?.slice(0, 2), // First 2 blocks
      })

      const previewMode =
        stripInvisible(sec.preview?.mode) ||
        stripInvisible(sec.preview?._type) ||
        (sec.preview?.textOverride ||
        sec.preview?.text ||
        sec.preview?.textExtractIndex
          ? 'text'
          : 'image')

      if (previewMode === 'text') {
        const manual = stripInvisible(
          sec.preview?.textOverride || sec.preview?.text
        )
        if (manual) return { type: 'text', content: manual }

        const extracted = getSectionTextExtract(
          sec,
          sec.preview?.textExtractIndex
        )
        if (extracted) return { type: 'text', content: extracted }
      }

      if (sec.preview?.image) {
        return { type: 'image', image: sec.preview.image }
      }

      // Fallback: find first image in section content
      if (sec?.content) {
        for (const block of sec.content) {
          if (
            (block?._type === 'imageBlock' ||
              block?._type === 'imageGallery') &&
            block?.images?.length
          ) {
            const firstImage = block.images.find((img: SanityImageSource) =>
              hasImageAsset(img)
            )
            if (firstImage) return { type: 'image', image: firstImage }
          }
        }
      }

      return { type: 'image', image: p.coverImage }
    }

    return { type: 'image', image: p.coverImage }
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

      <div className='px-4 lg:px-0 lg:mb-8 absolute -rotate-3 lg:rotate-0 left-1/2 -translate-x-1/2 lg:left-22 top-30 lg:top-16 z-20 w-[85vw] lg:w-[40vw] lg:translate-x-0'>
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
                width={1000}
                height={1000}
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

      <div className='mt-0 px-2 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-2 py-40 lg:pt-0 lg:pb-64 pt-0'>
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((item, idx) => {
            if (!item?.project) return null

            const preview = coverOrPreviewForItem(item)
            if (preview.type === 'image' && !hasImageAsset(preview.image))
              return null

            const isPersonal = isPersonalKind(item.project)
            const isLargePersonal =
              isPersonal && item.project.projectSize === 'large'
            const onClick = (e: React.MouseEvent) => {
              if (isPersonal && !isLargePersonal) {
                e.preventDefault()
                setModalProject({
                  title: item.project.title,
                  titleImageUrl: item.project.titleImage?.asset?.url,
                  coverImageUrl:
                    preview.type === 'image'
                      ? buildImageUrl(preview.image)
                      : undefined,
                  coverImage: item.project.coverImage,
                  description: item.project.description,
                  content: item.project.content,
                  writingContent: item.project.writingContent,
                  writingLayout: item.project.writingLayout,
                  images: item.project.images,
                  year: item.project.year,
                  projectSubtype: item.project.projectSubtype,
                })
              }
            }

            const offsetFactor = isMobile ? 0.55 : 1
            const rotationFactor = isMobile ? 0.7 : 1

            const responsiveX = (item.offsetX ?? 0) * offsetFactor
            const responsiveY = (item.offsetY ?? 0) * offsetFactor
            const responsiveRotation = (item.rotation ?? 0) * rotationFactor
            const responsiveScale = isMobile
              ? 1 - (1 - (item.scale ?? 1)) * 0.6
              : (item.scale ?? 1)

            return (
              <motion.div
                key={`${item._key}-${idx}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  x: responsiveX,
                  y: responsiveY,
                  rotate: responsiveRotation,
                  scale: responsiveScale,
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                className='relative mb-2 break-inside-avoid cursor-pointer'
                style={{ zIndex: item.zIndex || 0 }}
                onClick={onClick}
              >
                <Link href={hrefFor(item)} className='block relative'>
                  {preview.type === 'image' ? (
                    <CoverImage image={preview.image} />
                  ) : (
                    <div className='w-full flex items-center justify-center p-2 my-16 bg-gray-50'>
                      <p className='text-sm lg:text-base leading-tight whitespace-pre-wrap'>
                        {preview.content}
                      </p>
                    </div>
                  )}

                  {item.project.titleImage?.asset?.url && (
                    <div className='absolute top-4 right-4 z-10'>
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

                  <div className='absolute -bottom-8 right-0 z-10 text-black text-xs px-2 py-1 rounded'>
                    {item.project.title}
                    {item.project.year ? `, ${item.project.year}` : ''}
                  </div>
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
