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

      {/* Content wrapper: one place controls page padding & rhythm */}
      <div className='px-4 pt-32 sm:pt-20 lg:pt-16'>
        {/* HEADER: title image + description in FLOW */}
        <header className='mb-10 lg:mb-16'>
          <div className='lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start'>
            {/* Title image */}
            {project?.titleImage?.asset?.url && (
              <div className='lg:col-span-6 xl:-ml-64'>
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
              <div className='mt-8 lg:mt-6 lg:col-start-1 lg:col-span-9'>
                <p className='text-xl leading-[1] tracking-tight lg:text-5xl max-w-7xl'>
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
                className='scroll-mt-24'
              >
                {section.category.titleImage?.asset?.url ? (
                  <div className='flex justify-start items-center mb-0 lg:mb-5 mt-18'>
                    <Image
                      src={section.category.titleImage.asset.url}
                      alt={section.category.title}
                      width={1000}
                      height={700}
                      className='h-12 lg:h-24 w-auto object-contain -rotate-0'
                    />
                  </div>
                ) : (
                  <h2 className='text-3xl font-bold mb-8'>
                    {section.category.title}
                  </h2>
                )}

                <ContentRenderer content={section.content} />
              </section>
            ))}
          </section>
        )}

        {/* Credits */}
        <section className='mt-16 lg:mt-24'>
          <ProjectCredits
            credits={project.credits}
            press={project.press}
            tournee={project.tournee}
          />
        </section>

        {/* Project Navigation */}

        {/* Back link */}
        <div className='my-16'>
          <Link
            href='/productions'
            className='inline-flex items-center text-gray-600 hover:text-black transition-transitions'
          >
            <span className='mr-2'>←</span>
            Back to Productions
          </Link>
        </div>
      </div>
    </main>
  )
}
