import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { productionsPageQuery } from '@/sanity/lib/queries'
import ProductionsProjectCard from '../components/ProductionsProjectCard'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import PortableLinkMark from '@/app/components/portable/PortableLinkMark'
import { BrushMark } from '@/app/components/portable/BrushMark'

type FeaturedProjectItem = {
  project: {
    _id: string
    title: string | null
    slug: {
      current: string | null
    } | null
    titleImage?: {
      asset?: {
        url?: string | null
      } | null
    } | null
    coverImage: {
      asset?: {
        _ref: string
        _type: 'reference'
      }
      alt?: string | null
    } | null
  }
}

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: productionsPage } = await sanityFetch({
    query: productionsPageQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(productionsPage?.titleImage)

  // Convert PortableText to plain string or set to undefined
  const description = productionsPage?.description
    ? productionsPage.description
        .map(
          (block: any) =>
            block.children?.map((child: any) => child.text || '').join('') || ''
        )
        .join(' ')
        .trim()
    : undefined

  return {
    title: 'Productions',
    description,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

const portableTextComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className='whitespace-pre-line'>{children ?? null}</p>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <BrushMark seed='strong' color='#ccc'>
        {children ?? null}
      </BrushMark>
    ),
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode
      value?: any
    }) => (
      <PortableLinkMark value={value} internalQueryBasePath='/studio-works'>
        {children ?? null}
      </PortableLinkMark>
    ),
  },
}

export default async function ProductionsPage() {
  const { data: productionsPage } = await sanityFetch({
    query: productionsPageQuery,
  })

  if (!productionsPage) {
    return null
  }

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      {productionsPage.titleImage?.asset?.url && (
        <div className='px-8 pt-28 sm:pt-28 md:pt-16 xl:pt-24'>
          <Image
            src={productionsPage.titleImage.asset.url}
            alt='PRODUCTIONS'
            width={1000}
            height={1000}
            className='object-contain h-auto w-[85vw] lg:w-[40vw] -rotate-3 mx-auto lg:mx-0 lg:ml-22'
          />
        </div>
      )}

      {productionsPage.description && (
        <header className='px-8 pt-10 pb-14 sm:pb-16 md:pb-20 xl:pb-24'>
          <div className='xl:grid xl:grid-cols-12 xl:gap-x-16'>
            <div className='xl:col-start-5 xl:col-span-6 xl:row-start-1 xl:max-w-[80ch]'>
              <div className='text-lg xl:text-2xl leading-snug font-sans'>
                <PortableText
                  value={productionsPage.description}
                  components={portableTextComponents}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {productionsPage?.featuredProjects &&
        productionsPage.featuredProjects.length > 0 && (
          <section className='px-8 lg:px-0 pb-16 lg:pb-32 xl:px-44 xl:pr-68'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 gap-y-44 relative overflow-visible'>
              {productionsPage.featuredProjects.map(
                (item: FeaturedProjectItem, index: number) => (
                  <ProductionsProjectCard
                    key={index}
                    item={item}
                    priority={index < 6}
                  />
                )
              )}
            </div>
          </section>
        )}
    </main>
  )
}
