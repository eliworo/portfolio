'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'

type WritingSlide = {
  _key: string
  type: 'text' | 'image'
  content?: string
  imageUrl?: string
  caption?: string
  alt?: string
}

type MediaItem = {
  type: 'image' | 'video'
  url: string
  alt?: string
  title?: string
  posterUrl?: string
}

type ProjectModalProps = {
  project: {
    title: string
    titleImageUrl?: string
    description?: string
    year?: string
    content?: any
    coverImage?: {
      asset?: { _id?: string; url?: string }
      crop?: Record<string, number>
      hotspot?: Record<string, number>
      alt?: string
    }
    images?: Array<
      | {
          _type: 'image'
          asset?: { _id?: string; url?: string }
          crop?: Record<string, number>
          hotspot?: Record<string, number>
          alt?: string
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
      content?: string
      image?: {
        asset?: { _id?: string; _ref?: string; url?: string }
        crop?: Record<string, number>
        hotspot?: Record<string, number>
        alt?: string
      }
      caption?: string
    }>
  } | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [allMedia, setAllMedia] = useState<MediaItem[]>([])
  const [writingSlides, setWritingSlides] = useState<WritingSlide[]>([])

  useEffect(() => {
    if (!project) return

    if (project.projectSubtype === 'writing' && project.writingContent) {
      const slides: WritingSlide[] = project.writingContent
        .map((block) => {
          if (block._type === 'writingTextBlock' && block.content) {
            return {
              _key: block._key,
              type: 'text' as const,
              content: block.content,
            }
          }
          if (block._type === 'writingImageBlock' && block.image?.asset?.url) {
            return {
              _key: block._key,
              type: 'image' as const,
              imageUrl: block.image.asset.url,
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
        title: undefined, // Cover image doesn't have a separate title
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
            title: item.title,
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
  const isDoubleLayout =
    project?.writingLayout?.replace(/[^\w]/g, '') === 'double'

  const writingSpreads = useMemo(() => {
    if (!isWriting || !isDoubleLayout) return []
    const spreads: Array<{ left?: WritingSlide; right?: WritingSlide }> = []
    for (let i = 0; i < writingSlides.length; i += 2) {
      spreads.push({
        left: writingSlides[i],
        right: writingSlides[i + 1],
      })
    }
    return spreads
  }, [isWriting, isDoubleLayout, writingSlides])

  if (!project) return null

  const totalSlides = isWriting
    ? isDoubleLayout
      ? writingSpreads.length
      : writingSlides.length
    : allMedia.length

  const selectSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const renderTextBlock = (text?: string) => (
    <p className='text-base lg:text-lg leading-relaxed whitespace-pre-wrap'>
      {text}
    </p>
  )

  const renderImageBlock = (slide: WritingSlide) => (
    <div className='relative w-full min-h-[260px] h-full'>
      <Image
        src={slide.imageUrl!}
        alt={slide.alt || project.title}
        fill
        className='object-contain'
      />
      {slide.caption && (
        <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-sm'>
          {slide.caption}
        </div>
      )}
    </div>
  )

  const renderPageBlock = (slide?: WritingSlide) => {
    if (!slide) {
      return <div className='opacity-0 select-none h-full' aria-hidden />
    }
    return slide.type === 'text'
      ? renderTextBlock(slide.content)
      : renderImageBlock(slide)
  }

  const paginationItems = isWriting
    ? isDoubleLayout
      ? writingSpreads
      : writingSlides
    : allMedia

  const currentSingleSlide = !isDoubleLayout
    ? writingSlides[currentIndex]
    : null
  const currentSpread = isDoubleLayout ? writingSpreads[currentIndex] : null
  const currentMedia = !isWriting ? allMedia[currentIndex] : null

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
          className='relative bg-white/75 backdrop-blur-md rounded-lg w-full h-full p-2 lg:p-8 overflow-hidden'
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='flex flex-col h-full max-h-[100vh] overflow-hidden'>
            <div className='flex-1 overflow-y-auto flex flex-col pb-8 items-center justify-center'>
              {isWriting && paginationItems.length > 0 && (
                <div
                  className={`relative w-full ${
                    isDoubleLayout ? 'max-w-5xl' : 'max-w-3xl'
                  } max-h-[55vh] h-[55vh] rounded-lg flex items-center justify-center`}
                >
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={
                        isDoubleLayout
                          ? `spread-${currentIndex}`
                          : `slide-${currentSingleSlide?._key ?? currentIndex}`
                      }
                      className='relative w-full h-full flex items-center justify-center'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDoubleLayout && currentSpread ? (
                        <div className='flex gap-6 sm:gap-8 px-4 sm:px-8 py-10 w-full h-full overflow-y-auto'>
                          <div className='flex-1 border-r border-gray-200 pr-4 sm:pr-8'>
                            {renderPageBlock(currentSpread.left)}
                          </div>
                          <div className='flex-1 pl-4 sm:pl-8'>
                            {renderPageBlock(currentSpread.right)}
                          </div>
                        </div>
                      ) : (
                        currentSingleSlide && (
                          <div className='px-6 sm:px-8 py-12 max-w-2xl w-full h-full overflow-y-auto'>
                            {currentSingleSlide.type === 'text'
                              ? renderTextBlock(currentSingleSlide.content)
                              : renderImageBlock(currentSingleSlide)}
                          </div>
                        )
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {!isWriting && allMedia.length > 0 && currentMedia && (
                <div className='relative w-full max-h-[55vh] h-[55vh] rounded-lg overflow-hidden flex flex-col items-center justify-center'>
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={currentIndex}
                      className='relative w-full h-full flex items-center justify-center'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentMedia.type === 'image' ? (
                        <Image
                          src={currentMedia.url}
                          alt={currentMedia.alt || project.title}
                          fill
                          className='object-contain'
                        />
                      ) : (
                        <video
                          src={currentMedia.url}
                          controls
                          className='w-auto h-full object-contain'
                          poster={currentMedia.posterUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {currentMedia.title && (
                    <div className='mt-3 text-center'>
                      <p className='text-sm text-gray-700 italic'>
                        {currentMedia.title}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {totalSlides > 1 && (
                <div className='flex gap-2 py-2 mt-16 relative'>
                  {paginationItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'bg-black scale-125'
                          : 'bg-gray-400 hover:bg-gray-600'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}

                  <button
                    onClick={prevSlide}
                    className='absolute -left-24 top-1/2 -translate-y-1/2'
                  >
                    <Image
                      src='/images/arrowLeftLogo.png'
                      alt='Previous'
                      width={600}
                      height={600}
                      className='object-contain h-8 w-auto select-none pointer-events-none'
                    />
                  </button>
                  <button
                    onClick={nextSlide}
                    className='absolute -right-24 top-1/2 -translate-y-1/2'
                  >
                    <Image
                      src='/images/arrowRightLogo.png'
                      alt='Next'
                      width={600}
                      height={600}
                      className='object-contain h-8 w-auto select-none pointer-events-none'
                    />
                  </button>
                </div>
              )}

              <div className='flex justify-center items-center w-full my-8 mb-2'>
                <h1 className='text-2xl font-bold text-center'>
                  {project.title}
                  {project.year && (
                    <span className='text-gray-600'>, {project.year}</span>
                  )}
                </h1>
              </div>
              {project.description && (
                <p className='text-sm xl:text-lg text-gray-700 leading-tight px-2 max-w-3xl'>
                  {project.description}
                </p>
              )}

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
                          <p className='mb-3 text-sm'>{children}</p>
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
