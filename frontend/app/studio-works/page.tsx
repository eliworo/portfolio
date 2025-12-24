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
      <strong className='font-rader-medium'>{children}</strong>
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
    <main className='w-full lg:pl-60 lg:pr-8'>
      <div className='flex w-full'>
        <div className='hidden lg:block w-[45%]'></div>
        {studioWorks.description && (
          <div className='text-black text-lg mt-46 py-16 lg:mt-0 lg:text-2xl leading-[1.15] font-rader-regular lg:mb-12 w-full columns-1 lg:pt-32 lg:px-0 px-4 max-w-3xl'>
            <PortableText
              value={studioWorks.description}
              components={portableTextComponents}
            />
          </div>
        )}
      </div>
      {featured.length > 0 && (
        <CreativeProjectsList
          featuredProjects={featured}
          groupSlug='studio-works'
          groupTitleImageUrl={studioWorks?.titleImage?.asset?.url}
          groupTitle={studioWorks?.title}
          initialCategory={category}
          gridSpacing={studioWorks?.gridSpacing}
        />
      )}
    </main>
  )
}
