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

  const categoryNavItems = (project.categorySections as unknown as any[])
    .filter((section) => section.category && section.category._id) // Only keep valid categories
    .map((section) => ({
      id: section.category._id,
      title: section.category.title,
      titleImageUrl: section.category.titleImage?.asset?.url,
    }))

  return (
    <main className='min-h-screen px-8 pl-64'>
      {/* Category Navigation */}
      {categoryNavItems.length > 0 && (
        <CategoryNav categories={categoryNavItems} />
      )}

      {/* Title Section */}
      <div className='container mx-auto mb-16'>
        {project?.titleImage?.asset?.url ? (
          <div className='flex justify-start items-center mb-8 pt-16'>
            <Image
              src={project.titleImage.asset.url}
              alt={project.title}
              width={600}
              height={200}
              className='w-1/2 h-auto'
            />
          </div>
        ) : (
          <h1 className='text-5xl font-bold mb-8'>{project.title}</h1>
        )}

        {/* Project metadata */}
        {/* <div className='flex gap-6 text-sm text-gray-600 mb-4'>
          {project.year && <span>{project.year}</span>}
          {project.projectType && <span>{project.projectType}</span>}
        </div> */}

        {project.description && (
          <p className='text-4xl max-w-7xl'>{project.description}</p>
        )}
      </div>

      {/* Flexible Content Blocks */}
      {project.content && (
        <div className='container mx-auto'>
          <ContentRenderer content={project.content} />
        </div>
      )}

      {/* Category Sections */}
      {project.categorySections && project.categorySections.length > 0 && (
        <div className='space-y-24'>
          {project.categorySections.map((section) => (
            <section
              key={section.category._id}
              id={`category-${section.category._id}`}
              className='scroll-mt-24'
            >
              <div className='container mx-auto'>
                {/* Category Title Image or Title */}
                {section.category.titleImage?.asset?.url ? (
                  <div className='flex justify-start items-center mb-8'>
                    <Image
                      src={section.category.titleImage.asset.url}
                      alt={section.category.title}
                      width={300}
                      height={80}
                      className='h-20 w-auto object-contain'
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

      {/* Navigation */}
      <div className='container mx-auto my-16'>
        <Link
          href={`/works/${slug}`}
          className='inline-flex items-center text-gray-600 hover:text-black transition-colors'
        >
          <span className='mr-2'>←</span>
          Back to {project.projectType}
        </Link>
      </div>
    </main>
  )
}
