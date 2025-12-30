import { notFound, redirect } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { studioWorksQuery } from '@/sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import CreativeProjectsList from '../components/CreativeProjectsList'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import Link from 'next/link'

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: studioWorks } = await sanityFetch({
    query: studioWorksQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(studioWorks?.titleImage)

  return {
    title: studioWorks?.title || 'Studio Works',
    description: studioWorks?.description,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

const portableTextComponents = {
  marks: {
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className='font-rader-bold text-[26px]'>{children}</strong>
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

export default async function StudioWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const { data } = await sanityFetch({
    query: studioWorksQuery,
    stega: false,
  })
  const studioWorks = data as any

  if (!studioWorks) {
    notFound()
  }

  const featured = studioWorks?.featuredProjects || []

  if (category && featured.length > 0) {
    const allCategories = new Set<string>()

    featured.forEach((item: any) => {
      // Professional projects OR large personal projects with category sections
      if (
        item.categorySectionKey &&
        (item.project.projectKind === 'professional' ||
          (item.project.projectKind === 'personal' &&
            item.project.projectSize === 'large'))
      ) {
        const coreKey = item.categorySectionKey.substring(0, 12)
        const sec = item.project.categorySections?.find((s: any) =>
          s._key.startsWith(coreKey)
        )
        if (sec?.category?.slug?.current) {
          allCategories.add(sec.category.slug.current)
        }
      }

      // Small personal projects with categories
      if (
        item.project.projectKind === 'personal' &&
        item.project.projectSize !== 'large' &&
        item.project.categories
      ) {
        item.project.categories.forEach((cat: any) => {
          allCategories.add(cat.slug.current)
        })
      }
    })

    if (!allCategories.has(category)) {
      redirect('/studio-works')
    }
  }

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      {/* HEADER - only description text, no title image */}
      {studioWorks.description && (
        <header className='px-4 pt-16 sm:pt-20 md:pt-16 xl:py-28 xl:pt-32'>
          <div className='xl:grid xl:grid-cols-12 xl:gap-x-16'>
            <div
              className='
                xl:col-start-5 xl:col-span-6
                xl:row-start-1
                xl:max-w-[80ch]
              '
            >
              <div className='text-lg xl:text-2xl leading-[1.15] font-garabosse-gaillarde'>
                <PortableText
                  value={studioWorks.description}
                  components={portableTextComponents}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Projects Grid - title/category image handled here */}
      <section className='mt-14 xl:mt-24 xl:px-44 xl:pr-68'>
        {featured.length > 0 && (
          <CreativeProjectsList
            featuredProjects={featured}
            groupSlug='studio-works'
            groupTitleImageUrl={studioWorks?.titleImage?.asset?.url}
            groupTitle={studioWorks?.title}
            initialCategory={category}
            gridSpacing={studioWorks?.gridSpacing}
            useStackedTitles={true}
            stackedTitleStudioUrl={studioWorks?.titleImageStudio?.asset?.url}
            stackedTitleWorksUrl={studioWorks?.titleImageWorks?.asset?.url}
          />
        )}
      </section>
    </main>
  )
}
