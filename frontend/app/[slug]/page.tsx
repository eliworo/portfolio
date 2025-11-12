import { Image } from 'next-sanity/image'
import { notFound, redirect } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { projectGroupQuery } from '@/sanity/lib/queries'
import FilterableProjectsList from '@/app/components/FilterableProjectsList'
import { ProjectGroupQueryResult } from '@/sanity.types'
import CreativeProjectsList from '../components/CreativeProjectsList'

export default async function ProjectGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { slug } = await params
  const { category } = await searchParams

  const { data } = await sanityFetch({
    query: projectGroupQuery,
    params: { slug },
  })
  const projectGroup = data as any

  if (!projectGroup) {
    notFound()
  }

  console.log(projectGroup)

  const featured = projectGroup?.featuredProjects || []

  if (category && featured.length > 0) {
    const allCategories = new Set<string>()

    featured.forEach((item: any) => {
      if (
        item.categorySectionKey &&
        item.project.projectKind === 'professional'
      ) {
        const coreKey = item.categorySectionKey.substring(0, 12) // Normalize key
        const sec = item.project.categorySections?.find((s: any) =>
          s._key.startsWith(coreKey)
        )
        if (sec?.category?.slug) {
          allCategories.add(sec.category.slug)
        }
      }

      if (item.project.projectKind === 'personal' && item.project.categories) {
        item.project.categories.forEach((cat: any) => {
          allCategories.add(cat.slug.current)
        })
      }
    })

    if (!allCategories.has(category)) {
      redirect(`/${slug}`)
    }
  }

  return (
    <main className='w-full lg:pl-60 lg:pr-8'>
      <div className='flex w-full hidden'>
        <div className='hidden lg:block w-full'></div>
        {projectGroup?.description && (
          <div className='text-black/85 text-lg mt-46 py-16 lg:mt-0 lg:text-2xl leading-tight font-agrandir-tight lg:mb-12 w-full columns-1 lg:py-32 lg:px-0 px-4'>
            <p>{projectGroup.description}</p>
          </div>
        )}
      </div>

      {featured.length > 0 ? (
        <CreativeProjectsList
          featuredProjects={featured}
          groupSlug={slug}
          groupTitleImageUrl={projectGroup?.titleImage?.asset?.url}
          groupTitle={projectGroup?.title}
          initialCategory={category}
        />
      ) : (
        <FilterableProjectsList
          projects={projectGroup.projects}
          groupSlug={slug}
          isFeaturedProjectsPage={false}
          groupTitleImageUrl={projectGroup?.titleImage?.asset?.url}
          groupTitle={projectGroup?.title}
        />
      )}
    </main>
  )
}
