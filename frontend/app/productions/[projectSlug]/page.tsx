import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { productionsPageQuery, projectQuery } from '@/sanity/lib/queries'
import { ContentRenderer } from '@/app/components/ContentRenderer'
import CategoryNav from '@/app/components/CategoryNav'
import { ProjectCredits } from '@/app/components/ProjectCredits'
import ScrollToHash from '@/app/components/ScrollToHash'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { ProjectNavigation } from '@/app/components/ProjectNavigation'
import ProjectSectionsStackedNavClient from '@/app/components/ProjectSectionsStackedNavClient'

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
  projectKind?: string
  projectTypeSlug?: string
  categorySections?: CategorySection[]
  credits?: any
  press?: any
  tournee?: any
  content?: any
  coverImage?: any
}

export async function generateMetadata(
  { params }: { params: Promise<{ projectSlug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { projectSlug } = await params

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

export default async function ProductionsProjectPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>
}) {
  const { projectSlug } = await params

  const [projectResult, productionsResult] = await Promise.all([
    sanityFetch({
      query: projectQuery,
      params: { projectSlug },
      stega: false,
    }),
    sanityFetch({
      query: productionsPageQuery,
      stega: false,
    }),
  ])

  const project = projectResult.data as unknown as Project
  const productionsPage = productionsResult.data as any

  if (!project || project.projectKind !== 'professional') {
    notFound()
  }

  const featuredProjects = productionsPage?.featuredProjects || []
  const currentIndex = featuredProjects.findIndex(
    (item: any) => item.project.slug.current === projectSlug
  )

  const prevProject =
    currentIndex > 0
      ? {
          title: featuredProjects[currentIndex - 1].project.title,
          slug: featuredProjects[currentIndex - 1].project.slug.current,
          titleImageUrl:
            featuredProjects[currentIndex - 1].project.titleImage?.asset?.url,
        }
      : undefined

  const nextProject =
    currentIndex >= 0 && currentIndex < featuredProjects.length - 1
      ? {
          title: featuredProjects[currentIndex + 1].project.title,
          slug: featuredProjects[currentIndex + 1].project.slug.current,
          titleImageUrl:
            featuredProjects[currentIndex + 1].project.titleImage?.asset?.url,
        }
      : undefined

  const categoryNavItems = (project.categorySections ?? [])
    .filter((section) => section.category && section.category._id)
    .map((section) => ({
      id: section.category.slug.current,
      title: section.category.title,
      titleImageUrl: section.category.titleImage?.asset?.url ?? undefined,
    }))

  const useStackedTitles = true

  return (
    <main className='min-h-screen xl:pl-54 xl:px-68'>
      <ScrollToHash />

      {categoryNavItems.length > 0 &&
        (useStackedTitles ? (
          <ProjectSectionsStackedNavClient
            categories={categoryNavItems}
            groupTitleImages={{
              horizontal: project.titleImage?.asset?.url ?? undefined,
            }}
            titleVariant='stacked'
          />
        ) : (
          <CategoryNav
            categories={categoryNavItems}
            title='woronoff by category'
            projectTitleImageUrl={project.titleImage?.asset?.url ?? undefined}
            isProjectPage={true}
          />
        ))}

      {/* Content wrapper: one place controls page padding & rhythm */}
      <div className='px-8 pt-32 sm:pt-20 lg:pt-16'>
        {/* HEADER: title image + description in FLOW */}
        <header className='mb-10 lg:mb-16'>
          <div className='lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start'>
            {/* Title image */}
            {project?.titleImage?.asset?.url && (
              <div className='lg:col-span-8 xl:-ml-44'>
                <Image
                  src={project.titleImage.asset.url}
                  alt={project.title}
                  width={1200}
                  height={600}
                  priority
                  className='
                    object-contain
                    w-[85vw] max-w-[980px]
                    lg:w-full lg:max-w-none
                    h-auto
                    -rotate-3
                    mx-auto
                    lg:mx-0
                  '
                />
                <div className='-mt-4'>
                  <ProjectNavigation
                    prevProject={prevProject}
                    nextProject={nextProject}
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div className='mt-8 lg:mt-16 lg:col-start-1 lg:col-span-9'>
                <p className='text-xl leading-[1.15] tracking-tight lg:text-4xl max-w-7xl'>
                  {project.description}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        {project.content && (
          <section className='mb-16 lg:mb-24'>
            <ContentRenderer content={project.content} />
          </section>
        )}

        {/* Category sections */}
        {project.categorySections && project.categorySections.length > 0 && (
          <section className='space-y-20 lg:space-y-24'>
            {project.categorySections.map((section) => (
              <section
                key={section.category._id}
                id={section.category.slug.current}
                className='scroll-mt-[110px]'
              >
                {/* Sentinel for intersection observer */}
                <div data-section-sentinel className='h-px w-px' />

                <ContentRenderer content={section.content} />
              </section>
            ))}
          </section>
        )}

        {/* Credits */}
        <section className='mt-16 lg:my-32'>
          <ProjectCredits
            credits={project.credits}
            press={project.press}
            tournee={project.tournee}
          />
        </section>
      </div>
    </main>
  )
}
