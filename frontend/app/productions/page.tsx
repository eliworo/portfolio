import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { productionsPageQuery } from '@/sanity/lib/queries'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'
import ProductionsProjectCard from '../components/ProductionsProjectCard'
import CategoryNav from '@/app/components/CategoryNav'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import Link from 'next/link'

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
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong>{children}</strong>
    ),
    link: ({
      children,
      value,
    }: {
      children: React.ReactNode
      value?: { href?: string }
    }) => {
      const href = value?.href || '#'
      // Check if it's a category link (format: ?category=fashion)
      if (href.startsWith('?category=')) {
        const category = href.replace('?category=', '')
        return (
          <Link
            href={`/studio-works${href}`}
            className='underline decoration-2 underline-offset-4 hover:bg-yellow-100 transition-colors'
          >
            {children}
          </Link>
        )
      }
      return (
        <a
          href={href}
          className='underline decoration-2 underline-offset-4 hover:bg-yellow-100 transition-colors'
        >
          {children}
        </a>
      )
    },
  },
}

export default async function ProductionsPage() {
  const { data: productionsPage } = await sanityFetch({
    query: productionsPageQuery,
  })

  if (!productionsPage) {
    return null
  }

  const navItems =
    productionsPage?.featuredProjects?.map((item: any) => ({
      id: item.project._id,
      title: item.project.title,
      titleImageUrl: item.project.titleImage?.asset?.url,
      slug: item.project.slug.current,
    })) || []

  return (
    <main className='w-full lg:pl-60 lg:pr-8'>
      {/* Category Nav for Projects */}
      {/* {navItems.length > 0 && (
        <CategoryNav
          items={navItems}
          title='projects by woronoff'
          isProductionsPage={true}
          groupSlug='productions'
        />
      )} */}
      {productionsPage.titleImage?.asset?.url && (
        <div className='mb-8 absolute left-1/2 -translate-x-1/2 top-30 lg:left-22 lg:top-16 -rotate-3 z-10 w-[85vw] lg:w-[40vw] lg:translate-x-0'>
          <Image
            src={productionsPage.titleImage.asset.url}
            alt='PRODUCTIONS'
            width={1000}
            height={1000}
            className='object-contain h-auto'
          />
        </div>
      )}

      <div className='flex w-full'>
        <div className='hidden lg:block w-[45%]'></div>
        {productionsPage.description && (
          <div className='t-46 py-16 lg:mt-0 lg:text-2xl leading-snug lg:mb-12 w-full columns-1 lg:pt-32 lg:px-0 px-4 max-w-3xl'>
            <PortableText
              value={productionsPage.description}
              components={portableTextComponents}
            />
          </div>
        )}
      </div>

      {/* Featured Projects with Creative Layout */}
      {productionsPage?.featuredProjects &&
        productionsPage.featuredProjects.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 gap-y-44 relative overflow-visible pb-16 lg:pb-32 lg:pr-32 lg:pl-16'>
            {productionsPage.featuredProjects.map(
              (item: FeaturedProjectItem, index: number) => (
                <ProductionsProjectCard key={index} item={item} />
              )
            )}
          </div>
        )}
    </main>
  )
}
