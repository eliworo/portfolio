import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { projectQuery } from '@/sanity/lib/queries'
import { ContentRenderer } from '@/app/components/ContentRenderer'
import CategoryNav from '@/app/components/CategoryNav'
import { ProjectCredits } from '@/app/components/ProjectCredits'
import ScrollToHash from '@/app/components/ScrollToHash'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'

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
  projectKind?: string
  projectSize?: string
  projectTypeSlug?: string
  categorySections?: CategorySection[]
  credits?: any
  press?: any
  tournee?: any
  content?: any
}
type Props = {
  params: Promise<{ projectSlug: string }>
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { projectSlug } = await props.params
  const { data: project } = await sanityFetch({
    query: projectQuery,
    params: { projectSlug },
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(project?.coverImage)

  return {
    title: project?.title,
    description: project?.description,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function StudioWorksProjectPage(props: Props) {
  const { projectSlug } = await props.params

  const { data } = await sanityFetch({
    query: projectQuery,
    params: { projectSlug },
    stega: false,
  })

  const project = data as unknown as Project

  // Only show projects that belong to studio-works (personal large projects)
  if (
    !project ||
    !(project.projectKind === 'personal' && project.projectSize === 'large')
  ) {
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
    <main className='min-h-screen xl:pl-64'>
      <ScrollToHash />

      {categoryNavItems.length > 0 && (
        <CategoryNav
          categories={categoryNavItems}
          title='woronoff by category'
          projectTitleImageUrl={project.titleImage?.asset?.url ?? undefined}
          isProjectPage={true}
        />
      )}

      {project?.titleImage?.asset?.url && (
        <div className='mb-8 absolute left-1/2 -translate-x-1/2 top-30 lg:left-22 lg:top-16 -rotate-3 z-10 w-[85vw] lg:w-[40vw] lg:translate-x-0'>
          <Image
            src={project.titleImage.asset.url}
            alt={project.title}
            width={1000}
            height={500}
            className='object-contain h-auto'
          />
        </div>
      )}

      <div className='px-6 mb-8 xl:mb-16'>
        {project.description && (
          <p className='text-xl leading-tight lg:text-4xl max-w-7xl mt-68 xl:mt-88'>
            {project.description}
          </p>
        )}
      </div>

      {project.content && (
        <div className='px-6'>
          <ContentRenderer content={project.content} />
        </div>
      )}

      {project.categorySections && project.categorySections.length > 0 && (
        <div className='space-y-24 px-6'>
          {project.categorySections.map((section) => (
            <section
              key={section.category._id}
              id={section.category.slug.current}
              className='scroll-mt-[110px]'
            >
              <div className='border-4'>
                {section.category.titleImage?.asset?.url ? (
                  <div className='flex justify-start items-center mb-2 lg:mb-8 mt-16 xl:mt-32'>
                    <Image
                      src={section.category.titleImage.asset.url}
                      alt={section.category.title}
                      width={1000}
                      height={700}
                      className='h-16 lg:h-36 w-auto object-contain'
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

      <div className='px-6'>
        <ProjectCredits
          credits={project.credits}
          press={project.press}
          tournee={project.tournee}
        />
      </div>

      <div className='px-6 my-16'>
        <Link
          href='/studio-works'
          className='inline-flex items-center text-gray-600 hover:text-black transition-colors'
        >
          <span className='mr-2'>←</span>
          Back to Studio Works
        </Link>
      </div>
    </main>
  )
}
