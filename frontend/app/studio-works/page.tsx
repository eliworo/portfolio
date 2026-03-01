import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { studioWorksQuery } from '@/sanity/lib/queries'
import type { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'

import CreativeProjectsList from '../components/CreativeProjectsList'
import StudioWorksPortableText from '../components/portable/StudioWorksPortableText'

import { assertValidCategoryOrRedirect } from './_lib/validateCategory'
import StudioWorksTitleBlock from './StudioWorksTitleBlock'
import { deriveCategoryMapFromFeatured } from './_lib/deriveCategoryMap'

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
  if (!studioWorks) notFound()

  const featured = studioWorks?.featuredProjects || []

  assertValidCategoryOrRedirect({
    category,
    featuredProjects: featured,
    redirectTo: '/studio-works',
  })

  // Compute the "current category" title image in SERVER LAND
  // so the title block can be in normal flow (no absolute overlay hacks).
  const categoryMap = deriveCategoryMapFromFeatured(featured)
  const currentCategory = category ? categoryMap.get(category) || null : null

  const hasStackedTitle =
    Boolean(studioWorks?.titleImageStudio?.asset?.url) &&
    Boolean(studioWorks?.titleImageWorks?.asset?.url)

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      {/* Description */}
      {studioWorks.description && (
        <header className='hidden md:block px-4 pt-16 sm:pt-20 md:pt-16 xl:py-28 xl:pt-32'>
          <div className='xl:grid xl:grid-cols-12 xl:gap-x-16'>
            <div className='xl:col-start-5 xl:col-span-6 xl:row-start-1 xl:max-w-[80ch]'>
              <div className='text-lg xl:text-2xl leading-snug font-sans'>
                <StudioWorksPortableText value={studioWorks.description} />
              </div>
            </div>
          </div>
        </header>
      )}

      {!hasStackedTitle && (
        <StudioWorksTitleBlock
          groupTitleImageUrl={studioWorks?.titleImage?.asset?.url}
          groupTitle={studioWorks?.title}
          currentCategory={currentCategory}
        />
      )}

      {/* Grid */}
      <section className='mt-10 xl:mt-16 xl:px-44 xl:pr-68'>
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
            description={studioWorks.description}
          />
        )}
      </section>
    </main>
  )
}
