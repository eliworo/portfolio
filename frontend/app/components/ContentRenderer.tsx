import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { cleanBlock } from '@/utils/CleanInvisible'

type ContentBlock =
  | TextBlock
  | ImageBlock
  | ImageGallery
  | TextWithImage
  | VideoBlock

interface TextBlock {
  _type: 'textBlock'
  content: any[]
  columns: 'full' | 'two' | 'three'
  alignment: 'left' | 'center' | 'right'
}

interface ImageBlock {
  _type: 'imageBlock'
  images: Array<{
    asset: any
    alt: string
    caption?: string
    material?: string
    dimensions?: string
    year?: string
  }>
  layout: string
  position: 'left' | 'center' | 'right'
  spacing: 'compact' | 'normal' | 'spacious'
}

interface ImageGallery {
  _type: 'imageGallery'
  images: Array<{
    asset: any
    alt: string
    caption?: string
    material?: string
    dimensions?: string
    year?: string
  }>
  displayStyle: 'carousel' | 'grid' | 'masonry'
  aspectRatio: string
}

interface TextWithImage {
  _type: 'textWithImage'
  image: {
    asset: any
    alt: string
    caption?: string
  }
  text: any[]
  imagePosition: 'left' | 'right'
  imageSize: 'small' | 'medium' | 'large'
}

interface VideoBlock {
  _type: 'videoBlock'
  url: string
  caption?: string
  aspectRatio: string
}

export function ContentRenderer({ content }: { content: ContentBlock[] }) {
  const cleanContent = (content || []).map(cleanBlock)
  return (
    <div className='space-y-16'>
      {cleanContent.map((block, index) => {
        return (
          <div key={index}>
            {block._type === 'textBlock' && <TextBlockRenderer block={block} />}
            {block._type === 'imageBlock' && (
              <ImageBlockRenderer block={block} />
            )}
            {block._type === 'imageGallery' && (
              <ImageGalleryRenderer block={block} />
            )}
            {block._type === 'textWithImage' && (
              <TextWithImageRenderer block={block} />
            )}
            {block._type === 'videoBlock' && (
              <VideoBlockRenderer block={block} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function TextBlockRenderer({ block }: { block: TextBlock }) {
  const columnClasses = {
    full: 'max-w-4xl',
    two: 'columns-2 gap-8 max-w-6xl',
    three: 'columns-3 gap-8 max-w-7xl',
  }

  const alignmentClasses = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto',
  }

  return (
    <div
      className={`text-lg leading-snug ${columnClasses[block.columns]} ${
        alignmentClasses[block.alignment]
      }`}
    >
      <PortableText
        value={block.content}
        components={{
          types: {
            image: ({ value }) => (
              <figure className='my-8'>
                <Image
                  src={urlFor(value).url()}
                  alt={value.alt || ''}
                  width={800}
                  height={600}
                  className='w-full rounded-lg'
                />
                {value.caption && (
                  <figcaption className='text-center text-sm text-gray-600 mt-2'>
                    {value.caption}
                  </figcaption>
                )}
              </figure>
            ),
          },
        }}
      />
    </div>
  )
}

function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  const spacingClasses = {
    compact: 'gap-2',
    normal: 'gap-6',
    spacious: 'gap-12',
  } as const

  const positionClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  } as const

  const layoutClasses = {
    'single-full': 'w-full',
    'single-large': 'max-w-5xl',
    'single-medium': 'max-w-3xl',
    'two-row': 'grid grid-cols-2',
    'three-row': 'grid grid-cols-3',
  } as const

  type Layout = keyof typeof layoutClasses
  type Spacing = keyof typeof spacingClasses
  type Position = keyof typeof positionClasses

  const layout: Layout =
    (block.layout as Layout) in layoutClasses
      ? (block.layout as Layout)
      : 'single-full'

  const spacingKey = (block.spacing || 'normal')
    .replace(/\u200B/g, '')
    .trim() as Spacing
  const spacing = spacingKey in spacingClasses ? spacingKey : 'normal'
  const position: Position =
    (block.position as Position) in positionClasses
      ? (block.position as Position)
      : 'center'

  return (
    <div
      className={`${layoutClasses[layout]} ${spacingClasses[spacing]} ${
        !layout.includes('row') ? positionClasses[position] : ''
      }`}
    >
      {block.images.map((image, idx) => (
        <figure key={idx}>
          <Image
            src={urlFor(image).url()}
            alt={image.alt}
            width={1200}
            height={800}
            className='w-full h-auto'
          />
          {(image.caption ||
            image.material ||
            image.dimensions ||
            image.year) && (
            <figcaption className='text-sm text-gray-600 mt-3 space-y-1'>
              {image.caption && <p>{image.caption}</p>}
              <div className='flex gap-4 text-xs'>
                {image.material && <span>{image.material}</span>}
                {image.dimensions && <span>{image.dimensions}</span>}
                {image.year && <span>{image.year}</span>}
              </div>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

function ImageGalleryRenderer({ block }: { block: ImageGallery }) {
  if (block.displayStyle === 'carousel') {
    return (
      <CarouselGallery images={block.images} aspectRatio={block.aspectRatio} />
    )
  }

  // if (block.displayStyle === 'masonry') {
  //   return <MasonryGallery images={block.images} />
  // }

  // Grid layout
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {block.images.map((image, idx) => (
        <figure key={idx} className='group cursor-pointer'>
          <div className='relative overflow-hidden rounded-lg aspect-square'>
            <Image
              src={urlFor(image).url()}
              alt={image.alt}
              fill
              className='object-cover transition-transform group-hover:scale-105'
            />
          </div>
          {image.caption && (
            <figcaption className='text-sm text-gray-600 mt-2'>
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

function CarouselGallery({
  images,
  aspectRatio,
}: {
  images: ImageGallery['images']
  aspectRatio: string
}) {
  return (
    <div className='overflow-x-auto'>
      <div className='flex gap-6 pb-4'>
        {images.map((image, idx) => (
          <figure key={idx} className='flex-shrink-0 w-[80vw] max-w-4xl'>
            <div
              className='relative w-full'
              style={{
                aspectRatio:
                  aspectRatio === 'square'
                    ? '1/1'
                    : aspectRatio === 'landscape'
                      ? '16/9'
                      : aspectRatio === 'portrait'
                        ? '3/4'
                        : 'auto',
              }}
            >
              <Image
                src={urlFor(image).url()}
                alt={image.alt}
                fill={aspectRatio !== 'original'}
                width={aspectRatio === 'original' ? 1200 : undefined}
                height={aspectRatio === 'original' ? 800 : undefined}
                className={
                  aspectRatio === 'original' ? 'w-full h-auto' : 'object-cover'
                }
              />
            </div>
            {image.caption && (
              <figcaption className='text-sm text-gray-600 mt-3'>
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

function MasonryGallery({ images }: { images: ImageGallery['images'] }) {
  return (
    <div className='columns-2 md:columns-3 lg:columns-4 gap-4'>
      {images.map((image, idx) => (
        <figure key={idx} className='mb-4 break-inside-avoid'>
          <Image
            src={urlFor(image).url()}
            alt={image.alt}
            width={600}
            height={800}
            className='w-full h-auto rounded-lg'
          />
          {image.caption && (
            <figcaption className='text-sm text-gray-600 mt-2'>
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

function TextWithImageRenderer({ block }: { block: TextWithImage }) {
  const sizeClasses = {
    small: 'md:w-1/3',
    medium: 'md:w-1/2',
    large: 'md:w-2/3',
  }

  const imageSide =
    block.imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'

  return (
    <div className={`flex flex-col ${imageSide} gap-8 items-start`}>
      <figure className={`w-full ${sizeClasses[block.imageSize]}`}>
        <Image
          src={urlFor(block.image).url()}
          alt={block.image.alt}
          width={800}
          height={600}
          className='w-full h-auto'
        />
        {block.image.caption && (
          <figcaption className='text-sm text-gray-600 mt-2'>
            {block.image.caption}
          </figcaption>
        )}
      </figure>
      <div className='flex-1 text-lg leading-snug'>
        <PortableText value={block.text} />
      </div>
    </div>
  )
}

function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]
        : new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  const aspectRatioMap: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  }

  return (
    <figure className='max-w-5xl mx-auto'>
      <div
        className={`relative w-full ${aspectRatioMap[block.aspectRatio] || 'aspect-video'}`}
      >
        <iframe
          src={getEmbedUrl(block.url)}
          className='absolute inset-0 w-full h-full rounded-lg'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      </div>
      {block.caption && (
        <figcaption className='text-sm text-gray-600 mt-3 text-center'>
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}
