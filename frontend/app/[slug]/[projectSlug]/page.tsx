import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { projectQuery } from '@/sanity/lib/queries'
import { ContentRenderer } from '@/app/components/ContentRenderer'
import CategoryNav from '@/app/components/CategoryNav'
import { ProjectCredits } from '@/app/components/ProjectCredits'

type Category = {
  _id: string
  title: string
  slug: { current: string }
  titleImage?: { asset?: { url?: string | null } } | null
}

type CategorySection = {
  category: Category
  content?: any
}

type Project = {
  title: string
  titleImage?: { asset?: { url?: string | null } } | null
  description?: string
  projectType?: string
  projectTypeSlug?: string
  categorySections?: CategorySection[]
  credits?: any
  press?: any
  tournee?: any
  content?: any
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>
}) {
  const { slug, projectSlug } = await params

  const { data } = await sanityFetch({
    query: projectQuery,
    params: { projectSlug },
  })

  const project = data as unknown as Project

  if (!project || project.projectTypeSlug !== slug) {
    notFound()
  }

  const categoryNavItems = (project.categorySections ?? [])
    .filter((section) => section.category && section.category._id)
    .map((section) => ({
      id: section.category.slug.current,
      title: section.category.title,
      titleImageUrl: section.category.titleImage?.asset?.url ?? undefined,
    }))

  return (
    <main className='min-h-screen px-8 pl-64'>
      {categoryNavItems.length > 0 && (
        <CategoryNav
          categories={categoryNavItems}
          title='woronoff by category'
          isProjectPage={true}
        />
      )}

      <div className='container mx-auto mb-16'>
        {project?.titleImage?.asset?.url ? (
          <div className='fixed left-20 top-8 z-50'>
            <Image
              src={project.titleImage.asset.url}
              alt={project.title}
              width={1000}
              height={500}
              className='w-[40vw] h-auto -rotate-4'
            />
          </div>
        ) : (
          <h1 className='text-5xl font-bold mb-8'>{project.title}</h1>
        )}

        {project.description && (
          <p className='text-4xl max-w-7xl mt-88'>{project.description}</p>
        )}
      </div>

      {project.content && (
        <div className='container mx-auto'>
          <ContentRenderer content={project.content} />
        </div>
      )}

      {project.categorySections && project.categorySections.length > 0 && (
        <div className='space-y-24'>
          {project.categorySections.map((section) => (
            <section
              key={section.category._id}
              id={section.category.slug.current}
              className='scroll-mt-24'
            >
              <div className='container mx-auto'>
                {section.category.titleImage?.asset?.url ? (
                  <div className='flex justify-start items-center mb-8'>
                    <Image
                      src={section.category.titleImage.asset.url}
                      alt={section.category.title}
                      width={1000}
                      height={700}
                      className='h-35 w-auto object-contain'
                    />
                  </div>
                ) : (
                  <h2 className='text-3xl font-bold mb-8'>
                    {section.category.title}
                  </h2>
                )}
                <ContentRenderer content={section.content} />
              </div>
            </section>
          ))}
        </div>
      )}

      <div className='container mx-auto'>
        <ProjectCredits
          credits={project.credits}
          press={project.press}
          tournee={project.tournee}
        />
      </div>

      <div className='container mx-auto my-16'>
        <Link
          href={`/${slug}`}
          className='inline-flex items-center text-gray-600 hover:text-black transition-colors'
        >
          <span className='mr-2'>←</span>
          Back to {project.projectType}
        </Link>
      </div>
    </main>
  )
}
