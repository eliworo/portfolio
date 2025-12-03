import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { worksPageQuery } from '@/sanity/lib/queries'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(worksPage?.titleImage)

  const description = worksPage?.description
    ? worksPage.description
        .map(
          (block: any) =>
            block.children?.map((child: any) => child.text || '').join('') || ''
        )
        .join(' ')
        .trim()
    : undefined

  return {
    title: 'Works',
    description,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function WorksPage() {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
  })

  if (!worksPage) {
    return null
  }

  return (
    <main className='w-full '>
      {worksPage.titleImage?.asset?.url && (
        <div className='mb-8 absolute left-1/2 -translate-x-1/2 top-30 lg:left-22 lg:top-16 -rotate-3 z-10 w-[85vw] lg:w-[40vw] lg:translate-x-0'>
          <Image
            src={worksPage.titleImage.asset.url}
            alt='WORKS'
            width={600}
            height={200}
            className='object-contain w-auto h-[140px] lg:h-[200px]'
          />
        </div>
      )}

      <div className='flex w-full px-2 lg:px-16'>
        <div className='hidden lg:block w-full'></div>
        {worksPage.description && (
          <div className='text-black/85 text-lg mt-60 py-16 lg:mt-0 lg:text-2xl leading-tight font-agrandir-tight lg:mb-12 w-full columns-1 lg:py-32 lg:px-0 lg:pl-8 lg:max-w-3xl'>
            <PortableText value={worksPage.description} />
          </div>
        )}
      </div>

      {/* Featured Projects with Creative Layout */}
      {worksPage?.featuredProjects && worksPage.featuredProjects.length > 0 && (
        <div className='columns-2 md:columns-2 lg:columns-3 gap-2 lg:gap-6 relative overflow-hidden px-2 lg:px-0 lg:pl-60 lg:pr-8'>
          {worksPage.featuredProjects.map((item, index) => (
            <FeaturedProjectCard key={index} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}
