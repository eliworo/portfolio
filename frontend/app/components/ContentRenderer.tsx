import { PortableText } from '@portabletext/react'

import { urlFor } from '@/sanity/lib/image'
import { cleanBlock } from '@/utils/CleanInvisible'
import { Image } from 'next-sanity/image'
import CoverImage from './CoverImage'
import NextImage from 'next/image'
import Link from 'next/link'
import CarouselGalleryClient from './CarouselGalleryClient'
import ImageGalleryGrid from './ImageGalleryGrid'
import BrushFrame from './drawings/BrushFrame'
import BrushFrameRaster from './drawings/BrushFrameRaster'
import RealBrush from './drawings/RealBrush'
import VerticalLine from './lines/VerticalLine'

type ContentBlock =
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ImageGallery
  | TextWithImage
  | VideoBlock
  | MediaWithMedia

interface HeadingBlock {
  _type: 'headingBlock'
  text: string
  level: 'h2' | 'h3' | 'h4'
  alignment: 'left' | 'center' | 'right'
}

interface MediaWithMedia {
  _type: 'mediaWithMedia'
  leftMedia: {
    mediaType: 'video' | 'image'
    // Video fields
    url?: string
    caption?: string
    aspectRatio?: string
    // Image fields
    image?: {
      asset: any
      alt?: string
      caption?: string
      material?: string
      dimensions?: string
      year?: string
    }
  }
  rightMedia: {
    mediaType: 'video' | 'image'
    // Video fields
    url?: string
    caption?: string
    aspectRatio?: string
    // Image fields
    image?: {
      asset: any
      alt?: string
      caption?: string
      material?: string
      dimensions?: string
      year?: string
    }
  }
  layout: 'equal' | 'leftLarger' | 'rightLarger'
}

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
  verticalAlignment?: 'start' | 'center' | 'end'
}

interface VideoBlock {
  _type: 'videoBlock'
  url: string
  caption?: string
  aspectRatio: string
}

export function ContentRenderer({ content }: { content: ContentBlock[] }) {
  return (
    <div className='space-y-8 xl:space-y-16'>
      {(content || []).map((block, index) => {
        return (
          <div key={index}>
            {block._type === 'textBlock' && <TextBlockRenderer block={block} />}
            {block._type === 'headingBlock' && (
              <HeadingBlockRenderer block={block} />
            )}

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
            {block._type === 'mediaWithMedia' && (
              <MediaWithMediaRenderer block={block} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MediaWithMediaRenderer({ block }: { block: MediaWithMedia }) {
  const layoutClasses = {
    equal: 'md:grid-cols-2',
    leftLarger: 'md:grid-cols-[3fr_2fr]',
    rightLarger: 'md:grid-cols-[2fr_3fr]',
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]
        : new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
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

  const isCollage = (block as any).collageMode === true

  // Same idea as your ImageBlockRenderer: deterministic offsets
  const getYOffset = (seed: number) => {
    const random = Math.abs(Math.sin(seed)) * 100
    const offset = (random % 6) - 3 // -3..3 vh
    return Math.round(offset * 100) / 100
  }

  // two fixed seeds so it never changes on re-render (no hydration issues)
  const leftYOffset = isCollage ? getYOffset(11111) : 0
  const rightYOffset = isCollage ? getYOffset(22222) : 0

  // Same overlap behavior as your collage rows
  const overlapPx = isCollage ? -40 : 0

  return (
    <div
      className={`relative isolate grid grid-cols-1 ${layoutClasses[block.layout]} gap-4 lg:gap-8 w-full`}
    >
      {/* Left Media */}
      <div
        className={`w-full ${
          isCollage
            ? 'relative z-10 hover:z-[999] has-[iframe:hover]:z-[999]'
            : ''
        }`}
        style={
          isCollage
            ? {
                transform: `translateY(${leftYOffset}vh)`,
              }
            : undefined
        }
      >
        {block.leftMedia?.mediaType === 'video' && block.leftMedia?.url ? (
          <figure className='w-full mx-auto'>
            <div
              className={`relative w-full ${aspectRatioMap[block.leftMedia?.aspectRatio || '16:9']}`}
            >
              <iframe
                src={getEmbedUrl(block.leftMedia.url)}
                className='absolute inset-0 w-full h-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            </div>
            {block.leftMedia?.caption && (
              <figcaption className='text-sm text-gray-600 mt-3 text-left'>
                {block.leftMedia.caption}
              </figcaption>
            )}
          </figure>
        ) : block.leftMedia?.image ? (
          <figure className='w-full leading-none h-fit relative group'>
            <CoverImage image={block.leftMedia.image} />
            {(block.leftMedia.image.caption ||
              block.leftMedia.image.material ||
              block.leftMedia.image.dimensions ||
              block.leftMedia.image.year) && (
              <figcaption className='h-auto text-xs lg:text-sm text-gray-600 flex items-center leading-snug justify-start gap-1 mt-2 opacity-0 hidden lg:block group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto ml-1'>
                {block.leftMedia.image.caption && (
                  <p>{block.leftMedia.image.caption}</p>
                )}{' '}
                {block.leftMedia.image.year && (
                  <span>({block.leftMedia.image.year})</span>
                )}
              </figcaption>
            )}
          </figure>
        ) : null}
      </div>

      {/* Right Media */}
      <div
        className={`w-full ${
          isCollage
            ? 'relative z-20 hover:z-[999] has-[iframe:hover]:z-[999]'
            : ''
        }`}
        style={
          isCollage
            ? {
                marginLeft: overlapPx,
                transform: `translateY(${rightYOffset}vh)`,
              }
            : undefined
        }
      >
        {block.rightMedia?.mediaType === 'video' && block.rightMedia?.url ? (
          <figure className='w-full mx-auto'>
            <div
              className={`relative w-full ${aspectRatioMap[block.rightMedia?.aspectRatio || '16:9']}`}
            >
              <iframe
                src={getEmbedUrl(block.rightMedia.url)}
                className='absolute inset-0 w-full h-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
              />
            </div>
            {block.rightMedia?.caption && (
              <figcaption className='text-sm text-gray-600 mt-3 text-left'>
                {block.rightMedia.caption}
              </figcaption>
            )}
          </figure>
        ) : block.rightMedia?.image ? (
          <figure className='w-full leading-none h-fit relative group'>
            <CoverImage image={block.rightMedia.image} />
            {(block.rightMedia.image.caption ||
              block.rightMedia.image.material ||
              block.rightMedia.image.dimensions ||
              block.rightMedia.image.year) && (
              <figcaption className='h-auto text-xs lg:text-sm text-gray-600 flex items-center leading-snug justify-start gap-1 mt-2 opacity-0 hidden lg:block group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto ml-1'>
                {block.rightMedia.image.caption && (
                  <p>{block.rightMedia.image.caption}</p>
                )}{' '}
                {block.rightMedia.image.year && (
                  <span>({block.rightMedia.image.year})</span>
                )}
              </figcaption>
            )}
          </figure>
        ) : null}
      </div>
    </div>
  )
}

function TextBlockRenderer({ block }: { block: TextBlock }) {
  const columnClasses = {
    full: 'max-w-4xl',
    two: 'columns-2 gap-8 max-w-6xl',
    three: 'columns-1 xl:columns-3 gap-8 max-w-7xl',
  }

  const alignmentClasses = {
    left: 'mx-0',
    center: 'mx-auto',
    right: 'ml-auto',
  }

  return (
    <div
      className={`text-sm xl:text-xl leading-snug ${columnClasses[block.columns]} ${
        alignmentClasses[block.alignment]
      }`}
    >
      <PortableText
        value={block.content}
        components={{
          block: {
            normal: ({ children }) => (
              <p className='mb-4 last:mb-0 whitespace-pre-wrap'>{children}</p>
            ),
            h2: ({ children }) => (
              <h2 className='text-2xl font-bold mb-4 whitespace-pre-wrap'>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className='text-xl font-semibold mb-4 whitespace-pre-wrap'>
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className='text-lg font-semibold mb-4 whitespace-pre-wrap'>
                {children}
              </h4>
            ),
            blockquote: ({ children }) => (
              <blockquote className='ml-16 relative flex gap-3 mb-4 pl-6 whitespace-pre-wrap'>
                <div className='absolute left-0 top-0 h-full'>
                  <VerticalLine className='h-full' theme={{ fill: 'black' }} />
                </div>
                <span className='italic flex-1'>{children}</span>
              </blockquote>
            ),
          },
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
          marks: {
            strong: ({ children }) => (
              <BrushStrong seed='strong' color='#D9D9D9'>
                {children}
              </BrushStrong>
            ),
            em: ({ children }) => (
              <em className='font-rader-italic'>{children}</em>
            ),
            underline: ({ children }) => (
              <span className='underline'>{children}</span>
            ),
            link: ({ children, value }) => {
              const isInternal = value?.linkType === 'internal'
              const href = isInternal ? value?.internalLink : value?.href
              const openInNewTab = value?.openInNewTab

              if (!href) return <span>{children}</span>

              if (isInternal) {
                return (
                  <Link href={href} className='underline'>
                    {children}
                  </Link>
                )
              }

              return (
                <a
                  href={href}
                  className='underline'
                  target={openInNewTab ? '_blank' : undefined}
                  rel={openInNewTab ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              )
            },
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
    'two-row': 'grid grid-cols-2 items-start',
    'three-row': 'grid grid-cols-3 items-start',
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

  // Check if collage mode is enabled
  const isCollage = (block as any).collageMode === true

  // Generate consistent random Y offsets
  const getYOffset = (index: number) => {
    const seed = index * 54321
    const random = Math.abs(Math.sin(seed)) * 100
    const offset = index % 2 === 0 ? (random % 6) - 3 : ((random % 6) - 3) * -1
    return Math.round(offset * 100) / 100
  }

  // Generate overlap for multi-image layouts
  const getOverlap = (index: number) => {
    if (index === 0 || !isCollage) return 0
    return -40 // Overlap amount in pixels
  }

  if (isCollage && layout.includes('row')) {
    // Collage mode for multi-image layouts
    const imageCount = block.images?.length || 0

    // Adjust width based on number of images
    const widthClass =
      imageCount === 2
        ? 'w-[50%]' // 2 images take more space
        : imageCount === 3
          ? 'w-[33%]' // 3 images medium space
          : 'w-[25%]' // 4+ images smaller

    return (
      <div
        className={`relative isolate flex flex-wrap items-center ${!layout.includes('row') ? positionClasses[position] : ''}`}
      >
        {(block.images ?? []).map((image, idx) => {
          const yOffset = getYOffset(idx)
          const overlap = getOverlap(idx)

          return (
            <figure
              key={idx}
              className={`flex-shrink-0 relative ${widthClass} leading-none h-fit group [z-index:var(--z)] hover:z-[999]`}
              style={{
                marginLeft: overlap,
                transform: `translateY(${yOffset}vh)`,
                // Tailwind can override this because it's not the zIndex property directly
                ['--z' as any]: idx,
              }}
            >
              <CoverImage image={image} />
              {(image.caption ||
                image.material ||
                image.dimensions ||
                image.year) && (
                <figcaption className='h-auto text-xs lg:text-sm text-gray-600 flex items-center leading-snug justify-start gap-1 mt-2 opacity-0 hidden lg:block group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto ml-1'>
                  {image.caption && <p>{image.caption}</p>}{' '}
                  {image.year && <span>({image.year})</span>}
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    )
  }

  // Default rigid layout
  return (
    <div
      className={`${layoutClasses[layout]} ${spacingClasses[spacing]} ${
        !layout.includes('row') ? positionClasses[position] : ''
      }`}
    >
      {(block.images ?? []).map((image, idx) => (
        <figure key={idx} className='w-full leading-none h-fit relative group'>
          <CoverImage image={image} />
          {(image.caption ||
            image.material ||
            image.dimensions ||
            image.year) && (
            <figcaption className='h-auto text-xs lg:text-sm text-gray-600 flex items-center leading-snug justify-start gap-1 mt-2 opacity-0 hidden lg:block group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto ml-1'>
              {image.caption && <p>{image.caption}</p>}{' '}
              {image.year && <span>({image.year})</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

function ImageGalleryRenderer({ block }: { block: ImageGallery }) {
  if (block.displayStyle === 'carousel') {
    const preparedImages = block.images.map((img, idx) => ({
      id: img.asset._id || `img-${idx}`,
      url: urlFor(img).url(),
      alt: img.alt || '',
      caption: img.caption,
    }))

    return (
      <CarouselGalleryClient
        images={preparedImages}
        aspectRatio={block.aspectRatio}
      />
    )
  }

  // Prepare images for the grid
  const preparedImages = block.images.map((img, idx) => ({
    id: img.asset?._id || `img-${idx}`,
    url: urlFor(img).url(),
    alt: img.alt || '',
    caption: img.caption,
    width: img.asset?.metadata?.dimensions?.width,
    height: img.asset?.metadata?.dimensions?.height,
  }))

  return <ImageGalleryGrid images={preparedImages} />
}

// function CarouselGallery({
//   images,
//   aspectRatio,
// }: {
//   images: ImageGallery['images']
//   aspectRatio: string
// }) {
//   // Tailwind aspect ratio class
//   const aspectClass =
//     aspectRatio === 'square'
//       ? 'aspect-square'
//       : aspectRatio === 'landscape'
//         ? 'aspect-[16/9]'
//         : aspectRatio === 'portrait'
//           ? 'aspect-[3/4]'
//           : 'aspect-[16/9]'

//   return (
//     <div className='relative py-6'>
//       <div className='pointer-events-none absolute right-2 -bottom-2 lg:-bottom-4 z-10'>
//         <NextImage
//           src='/images/arrowRightLogo.png'
//           alt='Next'
//           width={150}
//           height={150}
//           className='object-contain h-8 lg:h-10 w-auto select-none'
//         />
//       </div>
//       <div className='overflow-x-auto'>
//         <div className='flex gap-0 pb-4'>
//           {images.map((image, idx) => (
//             <figure
//               key={idx}
//               className={`flex-shrink-0 w-[80vw] max-w-4xl relative ${aspectClass}`}
//             >
//               <div className='relative w-full h-full'>
//                 <Image
//                   src={urlFor(image).url()}
//                   alt={image.alt || `Image ${idx + 1}`}
//                   fill
//                   className='object-cover w-full h-full'
//                 />
//                 {image.caption && (
//                   <figcaption className='absolute bottom-0 left-0 w-full bg-black/60 text-white text-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10'>
//                     {image.caption}
//                   </figcaption>
//                 )}
//               </div>
//             </figure>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

function MasonryGallery({ images }: { images: ImageGallery['images'] }) {
  return (
    <div className='columns-2 md:columns-3 lg:columns-4 gap-4'>
      {images.map((image, idx) => (
        <figure key={idx} className='mb-4 break-inside-avoid'>
          <Image
            src={urlFor(image).url()}
            alt={image.alt || `Image ${idx + 1}`}
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

  const alignmentClasses = {
    start: 'md:items-start',
    center: 'md:items-center',
    end: 'md:items-end',
  }

  const imageSide =
    block.imagePosition === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'

  const verticalAlign = block.verticalAlignment || 'start'

  return (
    <div
      className={`flex flex-col ${imageSide} gap-8 ${alignmentClasses[verticalAlign]}`}
    >
      <figure
        className={`w-full ${sizeClasses[block.imageSize]} leading-none h-fit relative group`}
      >
        <CoverImage image={block.image} />
        {block.image.caption && (
          <figcaption className='absolute -bottom-8 left-0 w-full text-xs lg:text-sm text-gray-600 flex items-center leading-snug justify-start gap-1 pr-2 py-1 opacity-0 hidden lg:flex group-hover:opacity-100 transition-opacity duration-200'>
            {block.image.caption}
          </figcaption>
        )}
      </figure>
      <div className='flex-1 text-sm xl:text-lg leading-snug'>
        <PortableText value={block.text} />
      </div>
    </div>
  )
}

function VideoBlockRenderer({ block }: { block: VideoBlock }) {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]
        : new URL(url).searchParams.get('v')
      return `https://www.youtube.com/embed/${videoId}`
    }
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
    <figure className='w-full mx-auto'>
      <div
        className={`relative w-full ${aspectRatioMap[block.aspectRatio] || 'aspect-video'}`}
      >
        <iframe
          src={getEmbedUrl(block.url)}
          className='absolute inset-0 w-full h-full'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />

        {/* <BrushFrameRaster
          top={['/images/brush/top-1.png', '/images/brush/top-1.png']}
          right={['/images/brush/top-1.png', '/images/brush/top-1.png']}
          bottom={['/images/brush/top-1.png', '/images/brush/top-1.png']}
          left={['/images/brush/top-1.png', '/images/brush/top-1.png']}
          thicknessPx={54}
          bleedPx={30}
          opacity={1}
          blendMode='multiply'
          jitterPx={2}
        /> */}
      </div>

      {block.caption && (
        <figcaption className='text-sm text-gray-600 mt-3 text-left'>
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

function HeadingBlockRenderer({ block }: { block: HeadingBlock }) {
  // Only allow h2, h3, h4
  const allowed = ['h2', 'h3', 'h4'] as const
  const Tag = allowed.includes(block.level) ? block.level : 'h2'
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  }
  const sizeClasses = {
    h2: 'text-2xl lg:text-4xl p-2 pb-3 px-4',
    h3: 'text-xl lg:text-3xl',
    h4: 'text-lg lg:text-2xl px-2 pt-0 pb-0.5',
  }
  return (
    <div className={`w-full ${alignmentClasses[block.alignment]}`}>
      <Tag
        className={`font-right-grotesk-narrow-medium w-fit text-black ${sizeClasses[Tag]}`}
      >
        {block.text}
      </Tag>
    </div>
  )
}
function BrushStrong({
  children,
  seed,
  color = '#D9D9D9',
}: {
  children: React.ReactNode
  seed: string
  color?: string
}) {
  // Keep it inline, stable, and baseline-friendly
  return (
    <strong>
      <span className='relative inline-block align-baseline leading-[1.05]'>
        <RealBrush
          as='span'
          seed={seed}
          color={color}
          className='absolute -inset-x-2 -z-10 opacity-90'
          style={{
            height: '1.05em',
            top: '72%',
            transform: 'translateY(-50%)',
          }}
        />
        <span className='relative z-10'>{children}</span>
      </span>
    </strong>
  )
}
