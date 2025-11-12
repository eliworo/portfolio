import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { worksPageQuery } from '@/sanity/lib/queries'
import FeaturedProjectCard from '@/app/components/FeaturedProjectCard'

export default async function WorksPage() {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
  })

  if (!worksPage) {
    return null
  }

  return (
    <main className='w-full lg:pl-60 lg:pr-8'>
      {worksPage.titleImage?.asset?.url && (
        <div className='mb-8 fixed left-8 top-20 lg:left-22 lg:top-16 -rotate-3 z-10'>
          <Image
            src={worksPage.titleImage.asset.url}
            alt='WORKS'
            width={600}
            height={200}
            className='object-contain w-auto h-[140px] lg:h-[200px]'
          />
        </div>
      )}

      <div className='flex w-full'>
        <div className='hidden lg:block w-full'></div>
        {worksPage.description && (
          <div className='text-black/85 text-lg mt-46 py-16 lg:mt-0 lg:text-2xl leading-tight font-agrandir-tight lg:mb-12 w-full columns-1 lg:py-32 lg:px-0 px-4'>
            <PortableText value={worksPage.description} />
          </div>
        )}
      </div>

      {/* Featured Projects with Creative Layout */}
      {worksPage?.featuredProjects && worksPage.featuredProjects.length > 0 && (
        <div className='columns-1 md:columns-2 lg:columns-3 gap-6 relative overflow-hidden'>
          {worksPage.featuredProjects.map((item, index) => (
            <FeaturedProjectCard key={index} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}
