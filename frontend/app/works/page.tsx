import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import {
  worksPageQuery,
  projectTypesQuery,
  featuredProjectsQuery,
} from '@/sanity/lib/queries'
import FilterableProjectsList from '@/app/components/FilterableProjectsList'

export default async function WorksPage() {
  const [{ data: worksPage }, { data: featuredProjects }] = await Promise.all([
    sanityFetch({ query: worksPageQuery }),
    sanityFetch({ query: featuredProjectsQuery }),
  ])

  return (
    <main className='py-12 px-4'>
      {worksPage?.titleImage?.asset?.url && (
        <div className='absolute left-22 top-16'>
          <Image
            src={worksPage.titleImage.asset.url}
            alt='WORKS'
            width={600}
            height={200}
            style={{
              objectFit: 'contain',
              width: 'auto',
              maxHeight: '200px',
            }}
            className='-rotate-0'
          />
        </div>
      )}

      <div className='max-w-4xl px-16 ml-auto mt-32'>
        {/* Description */}
        {worksPage?.description && (
          <div className='text-black/85 text-2xl leading-snug font-agrandir-tight'>
            <PortableText value={worksPage.description} />
          </div>
        )}
      </div>

      {/* Featured Projects using FilterableProjectsList */}
      {featuredProjects && featuredProjects.length > 0 && (
        <div className='pl-64 mt-12'>
          <h2 className='sr-only'>Featured Projects</h2>
          <FilterableProjectsList
            projects={featuredProjects}
            // No specific group slug for featured projects
            isFeaturedProjectsPage={true}
          />
        </div>
      )}
    </main>
  )
}
