'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useDragControls,
} from 'motion/react'

import PaintBrush from './drawings/PaintBrush'
import ProjectModal from './ProjectModal'
import CategoryNav from './CategoryNav'
import CoverImage from './CoverImage'
import { urlForImage } from '@/sanity/lib/utils'

import { RiDragMove2Fill } from 'react-icons/ri'
import StackedCategoryTitles from './StackedCategoryTitles'
import RealBrush from './drawings/RealBrush'
import StudioWorksPortableText from './portable/StudioWorksPortableText'

/* =========================
   helpers (keep as-is)
========================= */

const stripInvisible = (s?: string) =>
  (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '').trim()

const normalizeCategoryKey = (key: string) =>
  stripInvisible(key).substring(0, 12)

const hasProject = (
  item: FeaturedProject
): item is FeaturedProject & {
  project: NonNullable<FeaturedProject['project']>
} => Boolean(item.project)

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
  kind?: 'project' | 'blank'
  blankLabel?: string
  blankSize?: 'sm' | 'md' | 'lg'

  offsetY?: number
  offsetX?: number
  rotation?: number
  scale?: number
  zIndex?: number
  categorySectionKey?: string

  project?: {
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

type Preview =
  | { type: 'image'; image?: any }
  | { type: 'text'; content: string }

const kindOf = (p: any) => String(p?.projectKind ?? '').toLowerCase()
const isPersonalKind = (p: any) => kindOf(p).includes('personal')
const isProfessionalKind = (p: any) => kindOf(p).includes('professional')

/* =========================
   NEW: Action model
========================= */

type CardAction =
  | { type: 'navigate'; href: string }
  | { type: 'modal'; href: string } // real href for "open in new tab", but normal click opens modal
  | { type: 'none' }

const isModifiedClick = (e: React.MouseEvent) =>
  e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1

/* =========================
   DraggableProjectCard (UPDATED with animations)
========================= */

function DraggableProjectCard({
  item,
  idx,
  isMobile,
  action,
  preview,
  brushPosition,
  brushRotation,
  brushColor,
  onOpenModal,
  childrenBrushAndTitle,
}: {
  item: any
  idx: number
  isMobile: boolean
  action: CardAction
  preview: Preview
  brushPosition: (k: string) => string
  brushRotation: (k: string) => number
  brushColor: (id: string) => string
  onOpenModal: () => void
  childrenBrushAndTitle: React.ReactNode
}) {
  const offsetFactor = isMobile ? 0.55 : 1
  const rotationFactor = isMobile ? 0.7 : 1

  const responsiveX = (item.offsetX ?? 0) * offsetFactor
  const responsiveY = (item.offsetY ?? 0) * offsetFactor
  const responsiveRotation = (item.rotation ?? 0) * rotationFactor

  // CMS scale should affect the image/preview only — NOT the brush or caption
  const responsiveScale = isMobile
    ? 1 - (1 - (item.scale ?? 1)) * 0.6
    : (item.scale ?? 1)

  const x = useMotionValue(responsiveX)
  const y = useMotionValue(responsiveY)

  useEffect(() => {
    x.set(responsiveX)
    y.set(responsiveY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsiveX, responsiveY])

  const dragControls = useDragControls()

  // robust click-after-drag guard
  const movedRef = useRef(false)
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null)
  const DRAG_CLICK_THRESHOLD = 6

  // hover caption
  const [hovered, setHovered] = React.useState(false)
  const hoverAreaRef = useRef<HTMLDivElement | null>(null)

  const captionX = useMotionValue(0)
  const captionY = useMotionValue(0)
  const captionOpacity = useMotionValue(0)

  const updateCaptionPos = (clientX: number, clientY: number) => {
    const el = hoverAreaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    captionX.set(clientX - rect.left)
    captionY.set(clientY - rect.top)
  }

  const actionGlyph =
    action.type === 'modal' ? '+' : action.type === 'navigate' ? '↗' : ''

  const handleActivate = (e: React.MouseEvent) => {
    // block activation if dragged
    if (movedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // modal cards: respect modified clicks (open new tab / etc)
    if (action.type === 'modal' && !isModifiedClick(e)) {
      e.preventDefault()
      e.stopPropagation()
      onOpenModal()
    }
    // navigate cards: default Link behavior
  }

  const CardInner = (
    <div className='group relative mb-10 break-inside-avoid select-none'>
      {/* Drag handle */}

      {/* MAIN VISUAL: rotation + scale apply ONLY here */}
      <motion.div
        style={{ rotate: responsiveRotation, scale: responsiveScale }}
        className='relative'
        whileHover={{ opacity: 0.98 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        {!isMobile && (
          <div className='absolute left-1/2 -translate-y-1/2 -translate-x-1/2 top-1/2 z-30 pointer-events-auto'>
            <div
              role='button'
              className='
        opacity-0 group-hover:opacity-100 transition-opacity duration-150
        cursor-grab select-none p-1
        relative
      '
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                pointerDownRef.current = { x: e.clientX, y: e.clientY }
                dragControls.start(e)
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              aria-label='Move card'
              tabIndex={-1}
            >
              <span className='absolute inset-0 flex items-center justify-center'>
                <RiDragMove2Fill
                  size={20}
                  className='
            text-white
            drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]
            drop-shadow-[0_0_6px_rgba(0,0,0,0.55)]
            scale-[1.08]
          '
                />
              </span>

              <RiDragMove2Fill
                size={20}
                className='
          relative
          text-black
          drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]
        '
              />
            </div>
          </div>
        )}

        {preview.type === 'image' ? (
          <CoverImage image={preview.image} />
        ) : (
          // Text preview with post-it background
          <div className='relative w-full my-16 flex items-center justify-center'>
            <div className='relative w-[280px] md:w-[320px]'>
              {/* Post-it background image - fixed aspect ratio */}
              <div className='relative aspect-[4/5]'>
                <Image
                  src='/images/postitLogo2.png'
                  alt=''
                  fill
                  className='object-fill'
                  sizes='(max-width: 768px) 280px, 320px'
                  draggable={false}
                />
              </div>

              {/* Text content overlay - absolutely positioned to match image bounds */}
              <div className='absolute inset-0 flex items-center justify-center p-10 md:py-18 md:px-16'>
                <div className='w-full h-full flex items-center justify-center overflow-hidden'>
                  <p className='text-xs md:text-sm leading-snug text-black whitespace-pre-line max-h-full overflow-y-auto scrollbar-hide'>
                    {preview.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Brushed Title (no pointer events) */}
      <motion.div
        className='absolute inset-0 z-20 pointer-events-none'
        style={{ rotate: responsiveRotation }}
      >
        {childrenBrushAndTitle}
      </motion.div>

      {/* Caption */}
      <motion.div
        className='pointer-events-none absolute left-0 top-0 z-40'
        style={{
          x: captionX,
          y: captionY,
          opacity: captionOpacity,
        }}
      >
        <div
          className='text-black text-base font-rader-bold px-1 py-0 whitespace-nowrap bg-white'
          style={{
            transform: 'translate(10px, 10px)',
            rotate: `${-responsiveRotation}deg`,
          }}
        >
          {item.project.title}
          {item.project.year ? `, ${item.project.year}` : ''}
          {actionGlyph ? (
            <span className='ml-2 opacity-80'>{actionGlyph}</span>
          ) : null}
        </div>
      </motion.div>
    </div>
  )

  const ClickableWrap =
    action.type === 'navigate' || action.type === 'modal' ? (
      <Link
        href={action.href}
        className='block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40'
        onClick={handleActivate}
        aria-label={item.project.title}
      >
        {CardInner}
      </Link>
    ) : (
      <div aria-disabled className='block opacity-60'>
        {CardInner}
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{
        opacity: { duration: 0.35, delay: idx * 0.04 },
        scale: { duration: 0.35, delay: idx * 0.04 },
        y: { duration: 0.35, delay: idx * 0.04 },
      }}
      drag={!isMobile}
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0.18}
      dragMomentum={false}
      whileDrag={{ cursor: 'grabbing', zIndex: 100 }}
      whileHover={isMobile ? undefined : { zIndex: 50 }}
      className='relative cursor-default'
      style={{
        x,
        y,
        zIndex: Math.max(0, item.zIndex || 0),
        touchAction: isMobile ? 'pan-y' : 'none',
      }}
      onPointerDown={(e) => {
        pointerDownRef.current = { x: e.clientX, y: e.clientY }
        movedRef.current = false
      }}
      onPointerMove={(e) => {
        if (isMobile) return
        if (!pointerDownRef.current) return
        const dx = e.clientX - pointerDownRef.current.x
        const dy = e.clientY - pointerDownRef.current.y
        if (Math.hypot(dx, dy) > DRAG_CLICK_THRESHOLD) movedRef.current = true
      }}
      onPointerUp={() => {
        pointerDownRef.current = null
      }}
      onDragStart={() => {
        if (isMobile) return
        movedRef.current = true
      }}
      onDragEnd={() => {
        // avoid "click on drag end" in some pointer sequences
        window.setTimeout(() => {
          movedRef.current = false
        }, 0)
      }}
    >
      <div
        ref={hoverAreaRef}
        onPointerEnter={(e) => {
          if (isMobile) return
          updateCaptionPos(e.clientX, e.clientY)
          captionOpacity.set(1)
          setHovered(true)
        }}
        onPointerLeave={() => {
          if (isMobile) return
          captionOpacity.set(0)
          setHovered(false)
        }}
        onPointerMove={(e) => {
          if (isMobile) return
          if (hovered) updateCaptionPos(e.clientX, e.clientY)
        }}
      >
        {ClickableWrap}
      </div>
    </motion.div>
  )
}

function BlankSpacer({
  item,
  isMobile,
  idx,
}: {
  item: FeaturedProject
  isMobile: boolean
  idx: number
}) {
  const offsetFactor = isMobile ? 0.55 : 1
  const rotationFactor = isMobile ? 0.7 : 1

  const responsiveX = (item.offsetX ?? 0) * offsetFactor
  const responsiveY = (item.offsetY ?? 0) * offsetFactor
  const responsiveRotation = (item.rotation ?? 0) * rotationFactor

  const responsiveScale = isMobile
    ? 1 - (1 - (item.scale ?? 1)) * 0.6
    : (item.scale ?? 1)

  const x = useMotionValue(responsiveX)
  const y = useMotionValue(responsiveY)

  useEffect(() => {
    x.set(responsiveX)
    y.set(responsiveY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsiveX, responsiveY])

  const base =
    item.blankSize === 'lg' ? 520 : item.blankSize === 'sm' ? 260 : 380

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.3, delay: idx * 0.04 },
      }}
      aria-hidden='true'
      className='pointer-events-none select-none'
      style={{
        x,
        y,
        rotate: responsiveRotation,
        scale: responsiveScale,
        zIndex: Math.max(0, item.zIndex || 0),
      }}
    >
      <div style={{ width: base, height: base }} />
    </motion.div>
  )
}

/* =========================
   CreativeProjectsList (UPDATED)
========================= */

export default function CreativeProjectsList({
  featuredProjects,
  groupSlug,
  groupTitleImageUrl,
  groupTitle,
  initialCategory,
  gridSpacing,
  useStackedTitles = false,
  stackedTitleStudioUrl,
  stackedTitleWorksUrl,
  description,
}: {
  featuredProjects: FeaturedProject[]
  groupSlug: string
  groupTitleImageUrl?: string
  groupTitle?: string
  initialCategory?: string
  gridSpacing?: {
    columnGap?: number
    rowGap?: number
  }
  useStackedTitles?: boolean
  stackedTitleStudioUrl?: string
  stackedTitleWorksUrl?: string
  description?: any
}) {
  const [modalProject, setModalProject] = React.useState<any>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    initialCategory || null
  )
  const [isMobile, setIsMobile] = React.useState(false)

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
    if (!p || !p.slug?.current) return '#'

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
      let url = `/studio-works/${p.slug.current}`
      if (item.categorySectionKey && p.categorySections) {
        const coreKey = normalizeCategoryKey(item.categorySectionKey)
        const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))
        if (sec?.category?.slug?.current) url += `#${sec.category.slug.current}`
      }
      return url
    }

    return '#'
  }
  // canonical href for modal items (allows cmd/ctrl-click new tab)
  const modalHrefFor = (p: any) => {
    const slug = p?.slug?.current
    if (!slug) return '#'
    return `/studio-works?project=${encodeURIComponent(slug)}`
  }

  const getCardAction = (item: FeaturedProject): CardAction => {
    const p = item.project
    if (!p) return { type: 'none' }

    const isPersonal = isPersonalKind(p)
    const isLargePersonal = isPersonal && p.projectSize === 'large'

    // modal: small personal
    if (isPersonal && !isLargePersonal) {
      return { type: 'modal', href: modalHrefFor(p) }
    }

    // navigate
    const href = hrefFor(item)
    if (href && href !== '#') return { type: 'navigate', href }

    return { type: 'none' }
  }

  const brushColors = ['#FFB6C1', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F8B88B']

  function hashString(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  const brushColor = (project: any) => {
    // Use project's custom brush color if available
    if (project?.brushColor && /^#[0-9A-Fa-f]{6}$/.test(project.brushColor)) {
      return project.brushColor
    }
    // Fallback to hash-based color
    const projectId = project?._id || ''
    return brushColors[hashString(projectId) % brushColors.length]
  }

  const brushRotation = (itemKey: string) => {
    const hash = hashString(itemKey + 'rotation')
    return (hash % 7) - 6 // keep your range
  }

  const brushPosition = (itemKey: string) => {
    const hash = hashString(itemKey + 'position')
    const positions = [
      'top-4 -left-8',
      'top-4 -right-8',
      'top-1/2 -translate-y-1/2 -left-8',
      'top-1/2 -translate-y-1/2 -right-8',
      'bottom-4 -left-8',
      'bottom-4 -right-8',
    ]
    return positions[hash % positions.length]
  }

  const allCategories = useMemo(() => {
    const pairs: [string, any][] = featuredProjects
      .filter(hasProject)
      .flatMap((item) => {
        const p = item.project
        const categories: [string, any][] = []

        if (
          item.categorySectionKey &&
          (isProfessionalKind(p) ||
            (isPersonalKind(p) && p.projectSize === 'large'))
        ) {
          const coreKey = normalizeCategoryKey(item.categorySectionKey)
          const sec = p.categorySections?.find((s) =>
            s._key.startsWith(coreKey)
          )
          if (sec?.category?.slug?.current) {
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

        if (isPersonalKind(p) && p.projectSize !== 'large' && p.categories) {
          p.categories.forEach((cat) => {
            if (!cat?.slug?.current) return
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

    return Array.from(new Map(pairs).values())
  }, [featuredProjects])

  const filteredProjects = useMemo(() => {
    if (!selectedCategory) return featuredProjects

    return featuredProjects.filter((item) => {
      if (!item.project) return false
      const p = item.project

      if (isPersonalKind(p) && p.projectSize !== 'large') {
        return p.categories?.some(
          (cat) => cat.slug.current === selectedCategory
        )
      }

      if (
        item.categorySectionKey &&
        p.categorySections &&
        (isProfessionalKind(p) ||
          (isPersonalKind(p) && p.projectSize === 'large'))
      ) {
        const coreKey = normalizeCategoryKey(item.categorySectionKey)
        const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))
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
    const textBlocks = section.content.filter(
      (block: any) =>
        block?._type === 'textBlock' || block?._type === 'textWithImage'
    )
    if (!textBlocks.length) return undefined
    const idx = Math.max(0, (index ?? 1) - 1)
    const target = textBlocks[idx] || textBlocks[textBlocks.length - 1]
    const content = target.content || target.text
    const plain = portableTextToPlain(content)
    return plain || undefined
  }

  const coverOrPreviewForItem = (item: FeaturedProject): PreviewResult => {
    const p = item.project
    if (!p) return { type: 'image', image: undefined }

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

    if (isPersonalKind(p) && p.projectSize !== 'large') {
      return { type: 'image', image: p.coverImage }
    }

    if (
      (isProfessionalKind(p) || p.projectSize === 'large') &&
      item.categorySectionKey &&
      p.categorySections?.length
    ) {
      const coreKey = normalizeCategoryKey(item.categorySectionKey)
      const sec = p.categorySections.find((s) => s._key.startsWith(coreKey))

      if (!sec) return { type: 'image', image: p.coverImage }

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

  const MOBILE_DIVISOR = 1.6
  const desktopColGap = gridSpacing?.columnGap ?? 8
  const desktopRowGap = gridSpacing?.rowGap ?? 8
  const colGap = isMobile ? desktopColGap / MOBILE_DIVISOR : desktopColGap
  const rowGap = isMobile ? desktopRowGap / MOBILE_DIVISOR : desktopRowGap

  return (
    <>
      {useStackedTitles ? (
        allCategories.length > 0 && (
          <StackedCategoryTitles
            groupTitle={groupTitle}
            groupTitleImages={{
              horizontal: groupTitleImageUrl,
              studio: stackedTitleStudioUrl,
              works: stackedTitleWorksUrl,
            }}
            titleVariant='stacked'
            categories={allCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )
      ) : (
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

          {/* IMPORTANT: Title image block REMOVED from here.
           The page now renders <StudioWorksTitleBlock/> in normal flow. */}
        </>
      )}

      {description && (
        <div className='px-8 mt-24 mb-16 md:hidden'>
          <div className='text-lg leading-snug font-garabosse-gaillarde'>
            <StudioWorksPortableText value={description} />
          </div>
        </div>
      )}

      <div
        className='mt-0 px-2 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 py-40 lg:pt-0 lg:pb-64 pt-0'
        style={{
          columnGap: `${colGap}px`,
          rowGap: `${rowGap}px`,
        }}
      >
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((item, idx) => {
            const itemKind = (item as any).kind ?? 'project'

            if (itemKind === 'blank') {
              return (
                <BlankSpacer
                  key={item._key}
                  item={item}
                  isMobile={isMobile}
                  idx={idx}
                />
              )
            }

            if (!item?.project) return null
            const p = item.project

            let preview = coverOrPreviewForItem(item)
            if (preview.type === 'image' && !hasImageAsset(preview.image)) {
              if (
                isPersonalKind(item.project) &&
                item.project.projectSize !== 'large'
              ) {
                return null
              }
              preview = {
                type: 'text',
                content: item.project.title || 'Project',
              }
            }

            const action = getCardAction(item)

            const openModal = () => {
              setModalProject({
                title: p.title,
                titleImageUrl: p.titleImage?.asset?.url,
                coverImageUrl:
                  preview.type === 'image'
                    ? buildImageUrl(preview.image)
                    : undefined,
                coverImage: p.coverImage,
                description: p.description,
                content: p.content,
                writingContent: p.writingContent,
                writingLayout: p.writingLayout,
                images: p.images,
                year: p.year,
                projectSubtype: p.projectSubtype,
              })
            }

            return (
              <DraggableProjectCard
                key={`${item._key}-${idx}`}
                item={item}
                idx={idx}
                isMobile={isMobile}
                action={action}
                preview={preview}
                brushPosition={brushPosition}
                brushRotation={brushRotation}
                brushColor={brushColor}
                onOpenModal={openModal}
                childrenBrushAndTitle={
                  item.project.titleImage?.asset?.url ? (
                    <div
                      className={`absolute ${brushPosition(item._key)} z-10`}
                    >
                      <div
                        className='relative'
                        style={{ rotate: `${brushRotation(item._key)}deg` }}
                      >
                        <RealBrush
                          seed={`category:${item.project._id}`}
                          color={brushColor(item.project)}
                          className='absolute -inset-x-2 bottom-0 h-14 inset-y-1 -z-10'
                        />
                        <div className='py-2'>
                          <Image
                            src={item.project.titleImage.asset.url}
                            alt={item.project.title}
                            width={500}
                            height={500}
                            className='object-contain h-12 w-auto'
                            draggable={false}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null
                }
              />
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
