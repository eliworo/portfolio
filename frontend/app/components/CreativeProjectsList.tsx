'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue } from 'motion/react'

import PaintBrush from './drawings/PaintBrush'
import ProjectModal from './ProjectModal'
import CategoryNav from './CategoryNav'
import CoverImage from './CoverImage'
import { urlForImage } from '@/sanity/lib/utils'

import StackedCategoryTitles from './StackedCategoryTitles'
import RealBrush from './drawings/RealBrush'
import StudioWorksPortableText from './portable/StudioWorksPortableText'
import ThreeDotsLoader from './ThreeDotsLoader'
import PaintedTitleImage from './PaintedTitleImage'

/* =========================
   helpers (keep as-is)
========================= */

const stripInvisible = (s?: string) =>
  (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '').trim()

const normalizeCategoryKey = (key: string) =>
  stripInvisible(key).substring(0, 12)

const hasProject = (
  item: FeaturedProject,
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
    (image.asset._ref || image.asset._id || image.asset._type === 'reference'),
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

const buildImageUrl = (
  image?: SanityImageSource,
  width = 1400,
  quality = 85,
) => {
  const normalized = normalizeImageSource(image)
  if (!normalized) return image?.asset?.url
  return (
    urlForImage(normalized)?.width(width).quality(quality).url() ||
    image?.asset?.url
  )
}

const GRID_PREVIEW_IMAGE_WIDTH = 1000
const CATEGORY_TRANSITION_MIN_MS = 250
const CATEGORY_TRANSITION_MAX_MS = 3500

type FeaturedProject = {
  _key: string
  kind?: 'project' | 'blank'
  blankLabel?: string
  blankSize?: 'sm' | 'md' | 'lg'
  hideOnDefaultList?: boolean

  offsetY?: number
  offsetX?: number
  rotation?: number
  scale?: number
  zIndex?: number
  categorySectionKey?: string

  project?: {
    _id: string
    title: string
    titleStyle?: 'normal' | 'bold' | 'large' | 'largeBold'
    slug: { current: string }
    projectKind: 'professional' | 'personal'
    projectSize?: 'small' | 'large'
    projectSubtype?: 'artwork' | 'writing'
    projectTypeSlug?: string
    titleImage?: { asset?: { url?: string } }
    coverImage?: SanityImageSource
    images?: Array<SanityImageSource & { title?: string }>
    description?: string
    descriptionRich?: any[]
    year?: string
    content?: any[]
    previewType?: 'image' | 'text'
    previewCustomText?: string
    textExtractIndex?: number
    writingContent?: Array<{
      _type: string
      _key: string
      verticalAlign?: 'top' | 'center' | 'bottom'
      contentRich?: any[]
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
      previewTextContent?: any[]
      firstImage?: SanityImageSource
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
const isLargePersonalKind = (p: any) =>
  isPersonalKind(p) && p?.projectSize === 'large'

const findCategorySectionByKey = (project: any, key?: string) => {
  if (!key || !Array.isArray(project?.categorySections)) return undefined
  const coreKey = normalizeCategoryKey(key)
  return project.categorySections.find((section: any) =>
    String(section?._key || '').startsWith(coreKey),
  )
}

const findCategorySectionBySlug = (
  project: any,
  categoryId?: string | null,
) => {
  if (!categoryId || !Array.isArray(project?.categorySections)) {
    return undefined
  }

  return project.categorySections.find(
    (section: any) => section?.category?.slug?.current === categoryId,
  )
}

const getCuratedCategorySection = (
  item: FeaturedProject,
  categoryId?: string | null,
) => {
  const project = item.project
  if (!project) return undefined

  const keyedSection = findCategorySectionByKey(
    project,
    item.categorySectionKey,
  )
  if (keyedSection) return keyedSection

  if (!item.categorySectionKey && isLargePersonalKind(project)) {
    return findCategorySectionBySlug(project, categoryId)
  }

  return undefined
}

/* =========================
   NEW: Action model
========================= */

type CardAction =
  | { type: 'navigate'; href: string }
  | { type: 'modal'; href: string } // real href for "open in new tab", but normal click opens modal
  | { type: 'none' }

const isModifiedClick = (e: React.MouseEvent) =>
  e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1

const preloadImageUrl = (url?: string) =>
  new Promise<void>((resolve) => {
    if (!url || typeof window === 'undefined') {
      resolve()
      return
    }

    const image = new window.Image()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }

    image.onload = finish
    image.onerror = finish
    image.src = url

    if (image.complete) finish()
  })

/* =========================
   DraggableProjectCard (UPDATED with animations)
========================= */

function DraggableProjectCard({
  item,
  idx,
  isMobile,
  action,
  preview,
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
  brushRotation: (k: string) => number
  brushColor: (id: string) => string
  onOpenModal: () => void
  childrenBrushAndTitle: React.ReactNode
}) {
  const offsetFactor = isMobile ? 0.35 : 1
  const rotationFactor = isMobile ? 0.6 : 1

  const responsiveX = (item.offsetX ?? 0) * offsetFactor
  const responsiveY = (item.offsetY ?? 0) * offsetFactor
  const responsiveRotation = (item.rotation ?? 0) * rotationFactor

  // CMS scale should affect the image/preview only — NOT the brush or caption
  const responsiveScale = isMobile
    ? 1 - (1 - (item.scale ?? 1)) * 0.45
    : (item.scale ?? 1)

  const x = useMotionValue(responsiveX)
  const y = useMotionValue(responsiveY)

  useEffect(() => {
    x.set(responsiveX)
    y.set(responsiveY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsiveX, responsiveY])

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
        {preview.type === 'image' ? (
          <CoverImage
            image={preview.image}
            sizes='(min-width: 768px) 25vw, 50vw'
            imageWidth={GRID_PREVIEW_IMAGE_WIDTH}
            unoptimized
          />
        ) : (
          // Text preview with paper background
          <div className='relative w-full my-16 flex items-center justify-center'>
            <div className='relative w-[280px] md:w-[320px]'>
              <div className='relative aspect-[4/5]'>
                <Image
                  src='/images/optimized/feuillePapierLogo1FondBlanc-700.webp'
                  alt=''
                  fill
                  className='object-fill'
                  sizes='(max-width: 768px) 280px, 320px'
                  draggable={false}
                />
              </div>

              <div className='absolute inset-0 flex items-center justify-center p-10 md:py-18 md:px-16'>
                <div className='w-full h-full flex items-center justify-center overflow-hidden'>
                  <p className='text-xs md:text-sm leading-snug text-black whitespace-pre-line max-h-full overflow-hidden'>
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
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
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
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
        y: { duration: 0.4 },
      }}
      drag={!isMobile}
      dragListener={!isMobile}
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
  const offsetFactor = isMobile ? 0.35 : 1
  const rotationFactor = isMobile ? 0.6 : 1

  const responsiveX = (item.offsetX ?? 0) * offsetFactor
  const responsiveY = (item.offsetY ?? 0) * offsetFactor
  const responsiveRotation = (item.rotation ?? 0) * rotationFactor

  const responsiveScale = isMobile
    ? 1 - (1 - (item.scale ?? 1)) * 0.45
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
  const [modalLoadingProjectId, setModalLoadingProjectId] = React.useState<
    string | null
  >(null)
  const modalAbortRef = useRef<AbortController | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    initialCategory || null,
  )
  const [pendingCategory, setPendingCategory] = React.useState<
    string | null | undefined
  >(undefined)
  const [isMobile, setIsMobile] = React.useState(false)
  const [showSkeleton, setShowSkeleton] = React.useState(false)
  const categoryTransitionRef = useRef(0)

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
      setPendingCategory(undefined)
      setShowSkeleton(false)
    }
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
      const sec = getCuratedCategorySection(item)
      if (sec?.category?.slug?.current) url += `#${sec.category.slug.current}`
      return url
    }

    if (isLargePersonalKind(p) && p.slug?.current) {
      let url = `/studio-works/${p.slug.current}`
      const sec = getCuratedCategorySection(item, selectedCategory)
      if (sec?.category?.slug?.current) url += `#${sec.category.slug.current}`
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
    const isLargePersonal = isLargePersonalKind(p)

    // modal: small personal
    if (isPersonal && !isLargePersonal) {
      return { type: 'modal', href: modalHrefFor(p) }
    }

    // navigate
    const href = hrefFor(item)
    if (href && href !== '#') return { type: 'navigate', href }

    return { type: 'none' }
  }

  const closeModal = React.useCallback(() => {
    modalAbortRef.current?.abort()
    modalAbortRef.current = null
    setModalLoadingProjectId(null)
    setModalProject(null)
  }, [])

  const openModalProject = React.useCallback(async (project: any) => {
    if (!project?._id) return

    modalAbortRef.current?.abort()
    const controller = new AbortController()
    modalAbortRef.current = controller
    setModalLoadingProjectId(project._id)

    try {
      const params = new URLSearchParams({ projectId: project._id })
      const response = await fetch(`/api/project-modal?${params.toString()}`, {
        signal: controller.signal,
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to load project modal: ${response.status}`)
      }

      const data = await response.json()
      if (!controller.signal.aborted) {
        setModalProject(data.project)
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error(error)
      }
    } finally {
      if (!controller.signal.aborted) {
        setModalLoadingProjectId(null)
        modalAbortRef.current = null
      }
    }
  }, [])

  const brushColors = [
    '#FFB6C1',
    '#98D8C8',
    '#F7DC6F',
    '#BEBBDA',
    '#F8B88B',
    '#347980',
    '#ccc',
  ]

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

  const brushPosition = (itemKey: string, isMobileLayout = false) => {
    const hash = hashString(itemKey + 'position')
    if (isMobileLayout) {
      return [
        { top: -5, left: -5 },
        { top: -5, right: -5 },
        { bottom: -5, left: -5 },
        { bottom: -5, right: -5 },
      ][hash % 4]
    }

    return [
      { top: 16, left: -32 },
      { top: 16, right: -32 },
      { top: '50%', left: -32, transform: 'translateY(-50%)' },
      { top: '50%', right: -32, transform: 'translateY(-50%)' },
      { bottom: 16, left: -32 },
      { bottom: 16, right: -32 },
    ][hash % 6]
  }

  const allCategories = useMemo(() => {
    const pairs: [string, any][] = featuredProjects
      .filter(hasProject)
      .flatMap((item) => {
        const p = item.project
        const categories: [string, any][] = []
        const addCategory = (cat: any) => {
          if (!cat?.slug?.current) return
          categories.push([
            cat.slug.current,
            {
              id: cat.slug.current,
              title: cat.title,
              titleImageUrl: cat.titleImage?.asset?.url,
            },
          ])
        }

        if (
          item.categorySectionKey &&
          (isProfessionalKind(p) || isLargePersonalKind(p))
        ) {
          const sec = getCuratedCategorySection(item)
          addCategory(sec?.category)
        }

        if (
          !item.categorySectionKey &&
          isLargePersonalKind(p) &&
          Array.isArray(p.categorySections)
        ) {
          for (const sec of p.categorySections) {
            addCategory(sec?.category)
          }
        }

        if (isPersonalKind(p) && p.projectSize !== 'large' && p.categories) {
          p.categories.forEach((cat) => {
            addCategory(cat)
          })
        }

        return categories
      })

    return Array.from(new Map(pairs).values())
  }, [featuredProjects])

  const filterProjectsForCategory = React.useCallback(
    (categoryId: string | null) => {
      if (!categoryId) {
        return featuredProjects.filter((item) => {
          if (!item.project) return true
          return item.hideOnDefaultList !== true
        })
      }

      return featuredProjects.filter((item) => {
        if (!item.project) return false
        const p = item.project

        if (isPersonalKind(p) && p.projectSize !== 'large') {
          return p.categories?.some((cat) => cat.slug.current === categoryId)
        }

        if (
          p.categorySections &&
          (isProfessionalKind(p) || isLargePersonalKind(p))
        ) {
          const sec = getCuratedCategorySection(item, categoryId)
          return sec?.category?.slug?.current === categoryId
        }

        return false
      })
    },
    [featuredProjects],
  )

  const filteredProjects = useMemo(
    () => filterProjectsForCategory(selectedCategory),
    [filterProjectsForCategory, selectedCategory],
  )

  const handleSelectCategory = (id: string | null) => {
    const nextCategory = selectedCategory === id ? null : id
    const transitionId = categoryTransitionRef.current + 1
    categoryTransitionRef.current = transitionId

    setShowSkeleton(true)
    setPendingCategory(nextCategory)

    try {
      const url = new URL(window.location.href)
      if (nextCategory) url.searchParams.set('category', nextCategory)
      else url.searchParams.delete('category')
      window.history.replaceState({}, '', url.toString())
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' })

    const imageUrls = getInitialPreviewImageUrls(nextCategory)
    const minimumDelay = new Promise((resolve) =>
      window.setTimeout(resolve, CATEGORY_TRANSITION_MIN_MS),
    )
    const preload = Promise.all(imageUrls.map(preloadImageUrl))
    const maxDelay = new Promise((resolve) =>
      window.setTimeout(resolve, CATEGORY_TRANSITION_MAX_MS),
    )

    void Promise.all([minimumDelay, Promise.race([preload, maxDelay])]).then(
      () => {
        if (categoryTransitionRef.current !== transitionId) return
        setSelectedCategory(nextCategory)
        setPendingCategory(undefined)
        requestAnimationFrame(() => setShowSkeleton(false))
      },
    )
  }

  const displayCategory =
    pendingCategory !== undefined ? pendingCategory : selectedCategory

  if (!featuredProjects?.length) {
    return (
      <div className='py-12 text-center text-gray-500'>
        No curated projects yet.
      </div>
    )
  }

  function portableTextToPlain(content: any): string {
    if (!content) return ''
    if (typeof content === 'string') return content
    if (!Array.isArray(content)) return ''
    return content
      .map((block: any) =>
        Array.isArray(block?.children)
          ? block.children.map((child: any) => child?.text || '').join('')
          : block?.text || '',
      )
      .join('\n')
      .replace(/\s+\n/g, '\n')
      .trim()
  }

  function getSectionTextExtract(section: any, index?: number) {
    const sectionContent = section?.previewTextContent || section?.content
    if (!sectionContent) return undefined
    const textBlocks = sectionContent.filter(
      (block: any) =>
        block?._type === 'textBlock' || block?._type === 'textWithImage',
    )
    if (!textBlocks.length) return undefined
    const idx = Math.max(0, (index ?? 1) - 1)
    const target = textBlocks[idx] || textBlocks[textBlocks.length - 1]
    const textContent = target.content || target.text
    const plain = portableTextToPlain(textContent)
    return plain || undefined
  }

  function coverOrPreviewForItem(
    item: FeaturedProject,
    categoryId: string | null = selectedCategory,
  ): PreviewResult {
    const p = item.project
    if (!p) return { type: 'image', image: undefined }

    if (isPersonalKind(p) && p.projectSubtype === 'writing') {
      if (p.previewType === 'text') {
        const manual = stripInvisible(p.previewCustomText)
        if (manual) {
          return { type: 'text', content: manual }
        }
      }

      if (p.previewType === 'text' && p.writingContent) {
        const textBlocks = p.writingContent.filter(
          (block) => block._type === 'writingTextBlock',
        )
        const targetIndex = Math.max(0, (p.textExtractIndex ?? 1) - 1)
        const selectedBlock = textBlocks[targetIndex] || textBlocks[0]
        const extracted = portableTextToPlain(
          selectedBlock?.contentRich || selectedBlock?.content,
        )
        if (extracted) {
          return { type: 'text', content: extracted }
        }
      }
      if (p.coverImage) return { type: 'image', image: p.coverImage }
      return { type: 'text', content: 'No preview available' }
    }

    if (isPersonalKind(p) && p.projectSize !== 'large') {
      return { type: 'image', image: p.coverImage }
    }

    const sec = getCuratedCategorySection(item, categoryId)
    if ((isProfessionalKind(p) || isLargePersonalKind(p)) && sec) {
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
          sec.preview?.textOverride || sec.preview?.text,
        )
        if (manual) return { type: 'text', content: manual }

        const extracted = getSectionTextExtract(
          sec,
          sec.preview?.textExtractIndex,
        )
        if (extracted) return { type: 'text', content: extracted }
      }

      if (sec.preview?.image) {
        return { type: 'image', image: sec.preview.image }
      }

      if (hasImageAsset(sec.firstImage)) {
        return { type: 'image', image: sec.firstImage }
      }

      return { type: 'image', image: p.coverImage }
    }

    return { type: 'image', image: p.coverImage }
  }

  function getInitialPreviewImageUrls(categoryId: string | null) {
    const limit = isMobile ? 2 : 4

    return filterProjectsForCategory(categoryId)
      .flatMap((item) => {
        if ((item as any).kind === 'blank' || !item.project) return []

        const preview = coverOrPreviewForItem(item, categoryId)
        if (preview.type !== 'image' || !hasImageAsset(preview.image)) return []

        const url = buildImageUrl(
          preview.image,
          GRID_PREVIEW_IMAGE_WIDTH,
        )
        return url ? [url] : []
      })
      .slice(0, limit)
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
            selectedCategory={displayCategory}
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
              selectedCategory={displayCategory}
            />
          )}

          {/* IMPORTANT: Title image block REMOVED from here.
           The page now renders <StudioWorksTitleBlock/> in normal flow. */}
        </>
      )}

      {description && (
        <div className='px-8 mt-18 mb-16 md:hidden'>
          <div className='text-lg leading-snug font-sans'>
            <StudioWorksPortableText value={description} />
          </div>
        </div>
      )}

      <div className='relative'>
        {showSkeleton && (
          <div className='absolute inset-0 z-30 flex items-start justify-center pt-16 pointer-events-none'>
            <ThreeDotsLoader className='w-full py-20' />
          </div>
        )}
        <div
          className='mt-0 px-4 sm:px-3 md:px-2 lg:px-2 grid grid-cols-2 md:grid-cols-4 py-40 md:py-24 lg:pb-64 pt-0 xl:py-16 xl:pb-64'
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
                void openModalProject(p)
              }

              return (
                <DraggableProjectCard
                  key={`${item._key}-${idx}`}
                  item={item}
                  idx={idx}
                  isMobile={isMobile}
                  action={action}
                  preview={preview}
                  brushRotation={brushRotation}
                  brushColor={brushColor}
                  onOpenModal={openModal}
                  childrenBrushAndTitle={
                    item.project.titleImage?.asset?.url ? (
                      <div
                        className='absolute z-10 w-max'
                        style={{
                          ...brushPosition(item._key, isMobile),
                          maxWidth: isMobile
                            ? 'calc(100% + 10px)'
                            : 'calc(100% - 1rem)',
                        }}
                      >
                        <div
                          className='relative origin-left scale-75 md:scale-100'
                          style={{
                            rotate: `${brushRotation(item._key)}deg`,
                          }}
                        >
                          <RealBrush
                            seed={`category:${item.project._id}`}
                            color={brushColor(item.project)}
                            className='absolute -inset-x-2 bottom-0 h-14 inset-y-1 -z-10'
                          />
                          <div className='py-2'>
                            <PaintedTitleImage
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
      </div>

      <ProjectModal
        key={modalProject?._id || modalProject?.title || 'empty-modal'}
        project={modalProject}
        onClose={closeModal}
      />

      {modalLoadingProjectId && !modalProject && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-sm'
          onClick={closeModal}
        >
          <ThreeDotsLoader className='w-full py-20' />
        </div>
      )}
    </>
  )
}
