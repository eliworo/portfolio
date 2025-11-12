'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'

type ProjectModalProps = {
  project: {
    title: string
    titleImageUrl?: string
    description?: string
    content?: any
    coverImageUrl?: string
    images?: Array<{ url: string; alt?: string }>
  } | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className='relative rounded-lg max-w-4xl w-full max-h-[90vh] p-8'
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-500 hover:text-black text-2xl z-10'
            aria-label='Close'
          >
            ×
          </button>

          {/* Title Image */}
          {project.titleImageUrl && (
            <div className='mb-6'>
              <Image
                src={project.titleImageUrl}
                alt={project.title}
                width={400}
                height={100}
                className='object-contain h-20 w-auto'
              />
            </div>
          )}

          {/* Description */}
          {project.description && (
            <p className='absolute left-0 bottom-0 text-xl mb-8 text-gray-700'>
              {project.description}
            </p>
          )}

          {/* Cover Image (if different from grid) */}
          {project.coverImageUrl && (
            <div className='mb-8'>
              <Image
                src={project.coverImageUrl}
                alt={project.title}
                width={800}
                height={600}
                className='w-full h-auto object-cover'
              />
            </div>
          )}

          {/* Content - Simple portable text rendering */}
          {project.content && Array.isArray(project.content) && (
            <div className='prose prose-lg max-w-none'>
              <PortableText
                value={project.content}
                components={{
                  types: {
                    imageBlock: ({ value }: any) => (
                      <div className='my-8'>
                        {value.images
                          ?.filter((img: any) => img.asset?.url)
                          .map((img: any, idx: number) => (
                            <Image
                              key={idx}
                              src={img.asset.url}
                              alt={img.alt || ''}
                              width={800}
                              height={600}
                              className='w-full h-auto mb-4'
                            />
                          ))}
                      </div>
                    ),
                    imageGallery: ({ value }: any) => (
                      <div className='grid grid-cols-2 gap-4 my-8'>
                        {value.images
                          ?.filter((img: any) => img.asset?.url)
                          .map((img: any, idx: number) => (
                            <Image
                              key={idx}
                              src={img.asset.url}
                              alt={img.alt || ''}
                              width={400}
                              height={400}
                              className='w-full h-auto rounded-lg'
                            />
                          ))}
                      </div>
                    ),
                    videoEmbed: ({ value }: any) =>
                      value.url ? (
                        <div className='my-8 aspect-video'>
                          <iframe
                            src={value.url}
                            className='w-full h-full rounded-lg'
                            allow='autoplay; fullscreen'
                            allowFullScreen
                          />
                        </div>
                      ) : null,
                  },
                  block: {
                    normal: ({ children }: any) => (
                      <p className='mb-4'>{children}</p>
                    ),
                    h2: ({ children }: any) => (
                      <h2 className='text-2xl font-bold mb-4'>{children}</h2>
                    ),
                    h3: ({ children }: any) => (
                      <h3 className='text-xl font-bold mb-3'>{children}</h3>
                    ),
                  },
                  marks: {
                    link: ({ children, value }: any) => (
                      <a
                        href={value.href}
                        className='text-blue-600 hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {children}
                      </a>
                    ),
                  },
                }}
              />
            </div>
          )}

          {/* Simple images array fallback */}
          {project.images && project.images.length > 0 && (
            <div className='space-y-6'>
              {project.images
                .filter((img) => img.url)
                .map((img, idx) => (
                  <Image
                    key={idx}
                    src={img.url}
                    alt={img.alt || project.title}
                    width={800}
                    height={600}
                    className='w-full h-auto rounded-lg'
                  />
                ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
