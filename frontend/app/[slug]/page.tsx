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

  const { data } = await sanityFetch({
    query: projectGroupQuery,
    params: { slug },
  })
  const projectGroup = data as ProjectGroupQueryResult

  if (!projectGroup) {
    notFound()
  }

  console.log('Project Group Data:', projectGroup)
  return (
    <main className='py-12 px-8 max-w-7xl mx-auto'>
      {/* Title Image */}
      {(projectGroup.titleImage as any)?.asset?.url && (
        <div className='mb-8 fixed left-22 top-16 z-20 w-[40vw]'>
          <Image
            src={(projectGroup.titleImage as any).asset.url}
            alt={projectGroup.title || 'Project Group Title'}
            width={600}
            height={200}
            className='object-contain h-auto border-0 border-black'
          />
        </div>
      )}

      {/* Description */}
      {projectGroup?.description && (
        <div className='mb-12 font-agrandir-tight text-2xl max-w-3xl'>
          <p>{projectGroup.description}</p>
        </div>
      )}

      {/* Projects List */}
      <FilterableProjectsList
        projects={projectGroup.projects}
        groupSlug={slug}
        isFeaturedProjectsPage={false}
      />
    </main>
  )
}
