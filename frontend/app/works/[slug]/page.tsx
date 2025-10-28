import Image from 'next/image'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { projectGroupQuery } from '@/sanity/lib/queries'
import FilterableProjectsList from '@/app/components/FilterableProjectsList'
import { ProjectGroupQueryResult } from '@/sanity.types'

export default async function ProjectGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch data for this project group
  const { data } = await sanityFetch({
    query: projectGroupQuery,
    params: { slug: (await params).slug },
  })

  const projectGroup = data as ProjectGroupQueryResult

  // If no project group is found, return 404
  if (!projectGroup) {
    notFound()
  }

  console.log(slug, 'slug')
  return (
    <>
      {/* Title Image */}
      {(projectGroup.titleImage as any)?.asset?.url && (
        <div className='absolute left-22 top-16'>
          <Image
            src={(projectGroup.titleImage as any).asset.url}
            alt={projectGroup.title || 'Project Group Title'}
            width={1000}
            height={1000}
            className='-rotate-0 object-contain h-50 w-auto'
          />
        </div>
      )}

      <main className='pl-64'>
        <div className='max-w-4xl mt-[22rem]'>
          {/* Description */}
          {projectGroup?.description && (
            <div className='mx-auto mb-12 font-agrandir-tight text-2xl'>
              <p>{projectGroup.description}</p>
            </div>
          )}
        </div>

        {/* Updated FilterableProjectsList Component */}
        <FilterableProjectsList
          projects={projectGroup.projects}
          groupSlug={slug}
          isFeaturedProjectsPage={false}
        />
      </main>
    </>
  )
}
