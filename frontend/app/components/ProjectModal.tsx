'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'

type WritingSlide = {
  _key: string
  type: 'text' | 'image'
  title?: string
  titleWeight?: 'normal' | 'bold'
  titleSize?: 'normal' | 'large'
  verticalAlign?: 'top' | 'center' | 'bottom'
  contentRich?: any[]
  content?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  imageBlurDataURL?: string
  caption?: string
  alt?: string
}

type MediaItem = {
  type: 'image' | 'video'
  url: string
  alt?: string
  caption?: string
  title?: string
  posterUrl?: string
  width?: number
  height?: number
  blurDataURL?: string
}

type ProjectModalProps = {
  project: {
    _id?: string
    title: string
    titleStyle?: 'normal' | 'bold' | 'large' | 'largeBold'
    titleImageUrl?: string
    description?: string
    descriptionRich?: any[]
    year?: string
    content?: any
    coverImage?: {
      asset?: {
        _id?: string
        url?: string
        metadata?: {
          dimensions?: { width?: number; height?: number }
          lqip?: string
        }
      }
      crop?: Record<string, number>
      hotspot?: Record<string, number>
      alt?: string
      caption?: string
    }
    images?: Array<
      | {
          _type: 'image'
          asset?: {
            _id?: string
            url?: string
            metadata?: {
              dimensions?: { width?: number; height?: number }
              lqip?: string
            }
          }
          crop?: Record<string, number>
          hotspot?: Record<string, number>
          alt?: string
          caption?: string
          title?: string
        }
      | {
          _type: 'videoItem'
          video?: {
            asset?: { url?: string }
          }
          title?: string
          poster?: {
            asset?: { url?: string }
          }
        }
    >
    projectSubtype?: 'artwork' | 'writing'
    writingLayout?: 'single' | 'double'
    writingContent?: Array<{
      _type: string
      _key: string
      title?: string
      titleWeight?: 'normal' | 'bold'
      titleSize?: 'normal' | 'large'
      verticalAlign?: 'top' | 'center' | 'bottom'
      contentRich?: any[]
      content?: string
      image?: {
        asset?: {
          _id?: string
          _ref?: string
          url?: string
          metadata?: {
            dimensions?: { width?: number; height?: number }
            lqip?: string
          }
        }
        crop?: Record<string, number>
        hotspot?: Record<string, number>
        alt?: string
      }
      caption?: string
    }>
  } | null
  onClose: () => void
}

type ModalProject = NonNullable<ProjectModalProps['project']>

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [writingSlides, setWritingSlides] = useState<WritingSlide[]>([])
  const [isCurrentMediaReady, setIsCurrentMediaReady] = useState(false)

  useEffect(() => {
    if (!project) return

    if (project.projectSubtype === 'writing' && project.writingContent) {
      const slides: WritingSlide[] = project.writingContent
        .map((block) => {
          if (
            block._type === 'writingTextBlock' &&
            (block.content ||
              (Array.isArray(block.contentRich) &&
                block.contentRich.length > 0))
          ) {
            return {
              _key: block._key,
              type: 'text' as const,
              verticalAlign: block.verticalAlign,
              contentRich: block.contentRich,
              content: block.content,
            }
          }
          if (block._type === 'writingImageBlock' && block.image?.asset?.url) {
            return {
              _key: block._key,
              type: 'image' as const,
              title: block.title,
              titleWeight: block.titleWeight,
              titleSize: block.titleSize,
              verticalAlign: block.verticalAlign,
              imageUrl: block.image.asset.url,
              imageWidth: block.image.asset.metadata?.dimensions?.width,
              imageHeight: block.image.asset.metadata?.dimensions?.height,
              imageBlurDataURL: block.image.asset.metadata?.lqip,
              caption: block.caption,
              alt: block.image.alt || '',
            }
          }
          return null
        })
        .filter(Boolean) as WritingSlide[]

      setWritingSlides(slides)
      setCurrentIndex(0)
      setAllMedia([])
      return
    }

    // For artwork projects: build carousel from coverImage + images/videos array
    const media: MediaItem[] = []

    // Add cover image first
    if (project.coverImage?.asset?.url) {
      media.push({
        type: 'image',
        url: project.coverImage.asset.url,
        alt: project.coverImage.alt || project.title,
        caption: project.coverImage.caption,
        width: project.coverImage.asset.metadata?.dimensions?.width,
        height: project.coverImage.asset.metadata?.dimensions?.height,
        blurDataURL: project.coverImage.asset.metadata?.lqip,
      })
    }

    // Then add additional images/videos from the images array
    if (project.images && Array.isArray(project.images)) {
      project.images.forEach((item) => {
        if (item._type === 'videoItem' && item.video?.asset?.url) {
          media.push({
            type: 'video',
            url: item.video.asset.url,
            title: item.title,
            posterUrl: item.poster?.asset?.url,
          })
        } else if (item._type === 'image' && item.asset?.url) {
          media.push({
            type: 'image',
            url: item.asset.url,
            alt: item.alt || project.title,
            caption: item.caption || item.title,
            title: item.title,
            width: item.asset.metadata?.dimensions?.width,
            height: item.asset.metadata?.dimensions?.height,
            blurDataURL: item.asset.metadata?.lqip,
          })
        }
      })
    }

    // Handle content blocks (for large personal/professional projects opened in modal)
    if (project.content && Array.isArray(project.content)) {
      project.content.forEach((block: any) => {
        if (block._type === 'imageBlock' && block.images) {
          block.images.forEach((img: any) => {
            if (img.asset?.url) {
              media.push({
                type: 'image',
                url: img.asset.url,
                alt: img.alt || '',
                width: img.asset.metadata?.dimensions?.width,
                height: img.asset.metadata?.dimensions?.height,
                blurDataURL: img.asset.metadata?.lqip,
              })
            }
          })
        } else if (block._type === 'imageGallery' && block.images) {
          block.images.forEach((img: any) => {
            if (img.asset?.url) {
              media.push({
                type: 'image',
                url: img.asset.url,
                alt: img.alt || '',
                width: img.asset.metadata?.dimensions?.width,
                height: img.asset.metadata?.dimensions?.height,
                blurDataURL: img.asset.metadata?.lqip,
              })
            }
          })
        }
      })
    }

    setAllMedia(media)
    setCurrentIndex(0)
    setWritingSlides([])
  }, [project])

  useEffect(() => {
    if (!project) return

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [project])

  const isWriting = project?.projectSubtype === 'writing'
  const isDoubleLayoutSetting =
    project?.writingLayout?.replace(/[^\w]/g, '') === 'double'
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches)
    }

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)

    return () => {
      mediaQuery.removeEventListener('change', updateViewport)
    }
  }, [])

  const useDoubleLayout = isDoubleLayoutSetting && !isMobileViewport
  const previousUseDoubleLayout = useRef(useDoubleLayout)

  const writingSpreads = useMemo(() => {
    if (!isWriting || !useDoubleLayout) return []
    const spreads: Array<{ left?: WritingSlide; right?: WritingSlide }> = []
    for (let i = 0; i < writingSlides.length; i += 2) {
      spreads.push({
        left: writingSlides[i],
        right: writingSlides[i + 1],
      })
    }
    return spreads
  }, [isWriting, useDoubleLayout, writingSlides])

  if (!project) return null

  const totalSlides = isWriting
    ? useDoubleLayout
      ? writingSpreads.length
      : writingSlides.length
    : allMedia.length

  useEffect(() => {
    if (!isWriting) return
    if (previousUseDoubleLayout.current === useDoubleLayout) return

    setCurrentIndex((prev) => {
      if (useDoubleLayout) {
        return Math.floor(prev / 2)
      }
      return Math.min(prev * 2, Math.max(0, writingSlides.length - 1))
    })

    previousUseDoubleLayout.current = useDoubleLayout
  }, [isWriting, useDoubleLayout, writingSlides.length])

  const selectSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1))
  }

  const prevSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const ModalBlurImage = ({
    src,
    alt,
    width,
    height,
    blurDataURL,
    className,
    onLoaded,
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    blurDataURL?: string
    className: string
    onLoaded?: () => void
  }) => {
    const FALLBACK_BLUR_DATA_URL =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+'

    return (
      <div className='overflow-hidden'>
        <Image
          src={src}
          alt={alt}
          width={width || 1600}
          height={height || 1200}
          className={className}
          placeholder='blur'
          blurDataURL={blurDataURL || FALLBACK_BLUR_DATA_URL}
          onLoad={onLoaded}
          onError={onLoaded}
        />
      </div>
    )
  }

  const PaperFrame = ({
    children,
    backgroundSrc = '/images/feuillePapierLogo1FondBlanc.png',
  }: {
    children: React.ReactNode
    backgroundSrc?: string
  }) => {
    return (
      <div className='relative w-[300px] sm:w-[360px] md:w-[420px]'>
        <div className='relative aspect-[4/5]'>
          <Image
            src={backgroundSrc}
            alt=''
            fill
            className='object-fill'
            draggable={false}
            priority
          />
        </div>

        <div className='absolute inset-0 flex items-center justify-center p-10 sm:p-12 md:px-20 md:py-10 xl:py-12 xl:pb-14'>
          <div className='w-full h-full overflow-hidden flex items-start justify-center'>
            {children}
          </div>
        </div>
      </div>
    )
  }

  const titleClassName = (slide?: WritingSlide) => {
    const weightClass =
      slide?.titleWeight === 'bold' ? 'font-semibold' : 'font-normal'
    const sizeClass =
      slide?.titleSize === 'large'
        ? 'text-base sm:text-lg md:text-xl'
        : 'text-sm sm:text-base md:text-lg'
    return `${weightClass} ${sizeClass}`
  }

  const modalTitleClassName = (
    style?: ModalProject['titleStyle'],
  ) => {
    switch (style) {
      case 'bold':
        return 'text-3xl font-right-grotesk-narrow-medium text-center font-semibold'
      case 'large':
        return 'text-4xl xl:text-5xl font-right-grotesk-narrow-medium text-center'
      case 'largeBold':
        return 'text-4xl xl:text-5xl font-right-grotesk-narrow-medium text-center font-semibold'
      default:
        return 'text-3xl font-right-grotesk-narrow-medium text-center'
    }
  }

  const writingTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className='mb-3 text-xs sm:text-sm md:text-base leading-snug text-black whitespace-pre-wrap last:mb-0'>
          {children}
        </p>
      ),
      h2: ({ children }: any) => (
        <p className='mb-3 text-sm sm:text-base md:text-lg leading-snug text-black whitespace-pre-wrap last:mb-0'>
          {children}
        </p>
      ),
      blockquote: ({ children }: any) => (
        <p className='mb-3 text-[11px] sm:text-xs md:text-sm leading-snug text-black whitespace-pre-wrap last:mb-0'>
          {children}
        </p>
      ),
    },
    marks: {
      strong: ({ children }: any) => (
        <strong className='font-semibold'>{children}</strong>
      ),
      em: ({ children }: any) => <em className='italic'>{children}</em>,
    },
  }

  const modalDescriptionComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className='mb-3 text-sm xl:text-2xl leading-snug text-black last:mb-0'>
          {children}
        </p>
      ),
      h2: ({ children }: any) => (
        <p className='mb-3 text-base xl:text-3xl leading-snug text-black last:mb-0'>
          {children}
        </p>
      ),
      blockquote: ({ children }: any) => (
        <p className='mb-3 text-xs xl:text-xl leading-snug text-black/75 last:mb-0'>
          {children}
        </p>
      ),
    },
    marks: writingTextComponents.marks,
  }

  const pageVerticalAlignClassName = (slide?: WritingSlide) => {
    switch (slide?.verticalAlign) {
      case 'center':
        return 'justify-center'
      case 'bottom':
        return 'justify-end'
      default:
        return 'justify-start'
    }
  }

  const renderWritingTextSlide = (
    slide?: WritingSlide,
    backgroundSrc?: string,
  ) => (
    <PaperFrame backgroundSrc={backgroundSrc}>
      <div className='relative flex w-full h-full flex-col overflow-hidden'>
        <div
          className={`flex h-full flex-col overflow-hidden pt-2 ${pageVerticalAlignClassName(slide)}`}
        >
          {Array.isArray(slide?.contentRich) && slide.contentRich.length > 0 ? (
            <PortableText
              value={slide.contentRich}
              components={writingTextComponents}
            />
          ) : (
            <p className='text-xs sm:text-sm md:text-base leading-snug text-black whitespace-pre-wrap overflow-hidden'>
              {slide?.content}
            </p>
          )}
        </div>
      </div>
    </PaperFrame>
  )

  const renderWritingImageSlide = (
    slide: WritingSlide,
    backgroundSrc?: string,
  ) => (
    <PaperFrame backgroundSrc={backgroundSrc}>
      <div className='relative flex w-full h-full flex-col overflow-hidden'>
        <div
          className={`flex h-full w-full flex-col items-center ${pageVerticalAlignClassName(slide)}`}
        >
          <div className='inline-flex max-w-full flex-col items-start'>
            {slide.title && (
              <h3
                className={`mb-3 w-full text-center leading-tight text-black ${titleClassName(slide)}`}
              >
                {slide.title}
              </h3>
            )}
            <ModalBlurImage
              src={slide.imageUrl!}
              alt={slide.alt || project.title}
              width={slide.imageWidth}
              height={slide.imageHeight}
              blurDataURL={slide.imageBlurDataURL}
              className='max-h-[34dvh] lg:max-h-[40dvh] w-auto h-auto object-contain'
            />
            {slide.caption && (
              <figcaption className='mt-1.5 max-w-full text-left text-[11px] leading-snug text-gray-600 sm:text-xs lg:text-sm'>
                {slide.caption}
              </figcaption>
            )}
          </div>
        </div>
      </div>
    </PaperFrame>
  )

  // const renderTextBlock = (text?: string) => (
  //   <p className='text-base lg:text-lg leading-relaxed whitespace-pre-wrap'>
  //     {text}
  //   </p>
  // )

  // const renderImageBlock = (slide: WritingSlide) => (
  //   <div className='relative w-full min-h-[260px] h-full'>
  //     <Image
  //       src={slide.imageUrl!}
  //       alt={slide.alt || project.title}
  //       fill
  //       className='object-contain'
  //     />
  //     {slide.caption && (
  //       <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-sm'>
  //         {slide.caption}
  //       </div>
  //     )}
  //   </div>
  // )

  const renderTextBlock = (slide?: WritingSlide, backgroundSrc?: string) =>
    renderWritingTextSlide(slide, backgroundSrc)
  const renderImageBlock = (slide: WritingSlide, backgroundSrc?: string) =>
    renderWritingImageSlide(slide, backgroundSrc)

  const renderPageBlock = (slide?: WritingSlide, backgroundSrc?: string) => {
    if (!slide) {
      return <div className='opacity-0 select-none h-full' aria-hidden />
    }
    return slide.type === 'text'
      ? renderTextBlock(slide, backgroundSrc)
      : renderImageBlock(slide, backgroundSrc)
  }

  const paginationItems = isWriting
    ? useDoubleLayout
      ? writingSpreads
      : writingSlides
    : allMedia

  const currentSingleSlide = !useDoubleLayout
    ? writingSlides[currentIndex]
    : null
  const currentSpread = useDoubleLayout ? writingSpreads[currentIndex] : null
  const currentMedia = !isWriting ? allMedia[currentIndex] : null

  useEffect(() => {
    setIsCurrentMediaReady(false)
  }, [currentIndex, project?._id, isWriting])

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className='fixed right-5 top-5 text-black hover:text-black text-3xl w-8 h-8 flex items-center justify-center z-50'
        >
          <Image
            src='/images/close.png'
            alt='Close menu'
            width={400}
            height={400}
            className='object-contain w-auto h-12'
          />
        </button>
        <motion.div
          className='relative bg-white/75 backdrop-blur-md w-full h-full p-2 lg:p-0 overflow-hidden'
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='flex flex-col h-full max-h-[100vh] overflow-hidden'>
            <div className='flex-1 overflow-y-auto flex flex-col pb-4 items-center'>
              {isWriting && paginationItems.length > 0 && (
                <div
                  className={`relative w-full ${
                    useDoubleLayout ? 'max-w-5xl' : 'max-w-3xl'
                  } max-h-[52dvh] h-[52dvh] lg:max-h-[58dvh] lg:h-[58dvh] flex items-center justify-center mt-6`}
                >
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={
                        useDoubleLayout
                          ? `spread-${currentIndex}`
                          : `slide-${currentSingleSlide?._key ?? currentIndex}`
                      }
                      className='relative w-full h-full flex items-center justify-center'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {useDoubleLayout && currentSpread ? (
                        <div className='flex gap-[2px] sm:gap-[4px] px-1 sm:px-2 py-3 sm:py-4 w-full h-full overflow-hidden items-center justify-center'>
                          <div className='flex-1 flex justify-end -mr-1 sm:-mr-2'>
                            {renderPageBlock(
                              currentSpread.left,
                              '/images/feuillePapierLogo1FondBlanc.png',
                            )}
                          </div>
                          <div className='flex-1 flex justify-start'>
                            {renderPageBlock(
                              currentSpread.right,
                              '/images/papierLogo2fFondBlanc.png',
                            )}
                          </div>
                        </div>
                      ) : (
                        currentSingleSlide && (
                          <div className='px-4 sm:px-6 py-3 sm:py-4 max-w-2xl w-full h-full overflow-hidden flex items-center justify-center mx-auto'>
                            {currentSingleSlide.type === 'text'
                              ? renderTextBlock(currentSingleSlide)
                              : renderImageBlock(currentSingleSlide)}
                          </div>
                        )
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {!isWriting && allMedia.length > 0 && currentMedia && (
                <div className='relative w-full max-h-[58dvh] h-[58dvh] lg:max-h-[66dvh] lg:h-[66dvh] overflow-visible flex flex-col items-center justify-center mt-6'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentIndex}
                      className='relative w-full h-full flex items-center justify-center'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className='w-full flex items-center justify-center'>
                        <div className='inline-flex flex-col items-start max-w-[92vw] lg:max-w-[1100px]'>
                          {currentMedia.type === 'image' ? (
                            <ModalBlurImage
                              src={currentMedia.url}
                              alt={currentMedia.alt || project.title}
                              width={currentMedia.width}
                              height={currentMedia.height}
                              blurDataURL={currentMedia.blurDataURL}
                              className='max-h-[58dvh] lg:max-h-[66dvh] w-auto h-auto object-contain'
                              onLoaded={() => setIsCurrentMediaReady(true)}
                            />
                          ) : (
                            <video
                              src={currentMedia.url}
                              controls
                              className='max-h-[58dvh] lg:max-h-[66dvh] w-auto h-auto object-contain'
                              poster={currentMedia.posterUrl}
                              onLoadedData={() => setIsCurrentMediaReady(true)}
                              onCanPlay={() => setIsCurrentMediaReady(true)}
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {(currentMedia.caption || currentMedia.title) && (
                            <figcaption
                              className={`mt-2 pl-1 text-xs lg:text-sm text-gray-600 leading-snug text-left transition-opacity duration-200 ${
                                isCurrentMediaReady
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              }`}
                            >
                              {currentMedia.caption || currentMedia.title}
                            </figcaption>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
              {totalSlides > 1 && (
                <div
                  className={`flex items-center gap-4 py-1 relative ${
                    isWriting ? 'mt-0' : 'mt-3 sm:mt-8'
                  }`}
                >
                  {/* Counter */}
                  <div className='text-lg lg:text-xl xl:text-2xl font-rader-medium'>
                    {currentIndex + 1}/{totalSlides}
                  </div>

                  {/* Navigation arrows */}
                  {currentIndex > 0 && (
                    <button
                      onClick={prevSlide}
                      className='absolute -left-16 lg:-left-22 top-1/2 -translate-y-1/2'
                      aria-label='Previous'
                    >
                      <Image
                        src='/images/arrowLeftLogo.png'
                        alt='Previous'
                        width={600}
                        height={600}
                        className='object-contain h-6 sm:h-7 lg:h-8 w-auto select-none pointer-events-none'
                      />
                    </button>
                  )}
                  {currentIndex < totalSlides - 1 && (
                    <button
                      onClick={nextSlide}
                      className='absolute -right-16 lg:-right-22 top-1/2 -translate-y-1/2'
                      aria-label='Next'
                    >
                      <Image
                        src='/images/arrowRightLogo.png'
                        alt='Next'
                        width={600}
                        height={600}
                        className='object-contain h-6 sm:h-7 lg:h-8 w-auto select-none pointer-events-none'
                      />
                    </button>
                  )}
                </div>
              )}

              <div className='flex justify-center items-center w-full mt-8 mb-2 px-2'>
                <h1 className={modalTitleClassName(project.titleStyle)}>
                  {project.title}
                  {project.year && (
                    <span className='opacity-50'>, {project.year}</span>
                  )}
                </h1>
              </div>
              {(Array.isArray(project.descriptionRich) &&
                project.descriptionRich.length > 0) ||
              project.description ? (
                <div className='mt-4 px-2 max-w-3xl font-normal mb-2'>
                  {Array.isArray(project.descriptionRich) &&
                  project.descriptionRich.length > 0 ? (
                    <PortableText
                      value={project.descriptionRich}
                      components={modalDescriptionComponents}
                    />
                  ) : (
                    <p className='text-sm xl:text-2xl leading-snug'>
                      {project.description}
                    </p>
                  )}
                </div>
              ) : null}

              {!isWriting && project.content && (
                <div className='prose prose-sm max-w-none px-2'>
                  <PortableText
                    value={project.content}
                    components={{
                      types: {
                        imageBlock: () => null,
                        imageGallery: () => null,
                        videoEmbed: ({ value }: any) =>
                          value.url ? (
                            <div className='my-4 aspect-video'>
                              <iframe
                                src={value.url}
                                className='w-full h-full'
                                allow='autoplay; fullscreen'
                                allowFullScreen
                              />
                            </div>
                          ) : null,
                      },
                      block: {
                        normal: ({ children }: any) => (
                          <p className='mb-3 text-sm whitespace-pre-line'>
                            {children}
                          </p>
                        ),
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
