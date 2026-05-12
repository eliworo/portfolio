import Image from 'next/image'
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
import RealBrush from '@/app/components/drawings/RealBrush'
import PaintedTitleImage from '@/app/components/PaintedTitleImage'

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
  _id: string
  title: string
  titleImage?: { asset?: { url?: string | null } } | null
  description?: string
  brushColor?: string | null
  ticketsUrl?: string
  projectKind?: string
  projectTypeSlug?: string
  categorySections?: CategorySection[]
  credits?: any
  press?: any
  tournee?: any
  content?: any
  coverImage?: any
}

const projectBrushColors = [
  '#FFB6C1',
  '#98D8C8',
  '#F7DC6F',
  '#BEBBDA',
  '#F8B88B',
  '#347980',
  '#ccc',
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getProjectBrushColor(project: Project) {
  const customColor = project.brushColor?.trim()
  if (customColor && /^#[0-9A-Fa-f]{6}$/.test(customColor)) {
    return customColor
  }

  return projectBrushColors[hashString(project._id) % projectBrushColors.length]
}

export async function generateMetadata(
  { params }: { params: Promise<{ projectSlug: string }> },
  parent: ResolvingMetadata,
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
    (item: any) => item.project.slug.current === projectSlug,
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
  const projectBrushColor = getProjectBrushColor(project)

  return (
    <main className='min-h-screen min-[1180px]:pl-54 min-[1180px]:px-68'>
      <ScrollToHash />

      {categoryNavItems.length > 0 &&
        (useStackedTitles ? (
          <ProjectSectionsStackedNavClient
            categories={categoryNavItems}
            groupTitleImages={{
              horizontal: project.titleImage?.asset?.url ?? undefined,
            }}
            projectTitle={{
              title: project.title,
              titleImageUrl: project.titleImage?.asset?.url ?? undefined,
              brushColor: projectBrushColor,
            }}
            projectTitleTargetId='project-title-anchor'
            mobileCategoryNavRevealTargetId='project-description-anchor'
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
      <div className='px-8 pt-32 pb-4 sm:pt-20 min-[1180px]:pt-16 min-[1180px]:pb-0'>
        {/* HEADER: title image + description in FLOW */}

        <header className='mb-10 min-[1180px]:mb-16'>
          {project.ticketsUrl && (
            <div className='fixed right-8 top-22 min-[1180px]:top-8 min-[1180px]:right-16 z-10'>
              <a
                href={project.ticketsUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Open tickets'
                className='relative inline-block px-2 py-1 opacity-80 hover:opacity-100 transition-opacity'
              >
                {/* Black brush background */}
                <RealBrush
                  seed='tickets-brush'
                  color='#000'
                  className='absolute -inset-x-1 z-0'
                  style={{
                    height: '130%',
                    top: '45%',
                    transform: 'translateY(-50%)',
                  }}
                />
                {/* Tickets logo on top */}
                <Image
                  src='/images/optimized/ticketsLogo-blanc-700.webp'
                  alt='Tickets'
                  width={700}
                  height={235}
                  className='h-6 lg:h-7 w-auto relative z-10'
                  draggable={false}
                  priority
                />
              </a>
            </div>
          )}
          <div className='min-[1180px]:grid min-[1180px]:grid-cols-12 min-[1180px]:gap-x-10 min-[1180px]:items-start'>
            {/* Title image */}
            {project?.titleImage?.asset?.url && (
              <div
                id='project-title-anchor'
                className='min-[1180px]:col-span-8 min-[1180px]:-ml-44'
              >
                <PaintedTitleImage
                  src={project.titleImage.asset.url}
                  alt={project.title}
                  width={1200}
                  height={600}
                  priority
                  className='
                    object-contain
                    w-[85vw] max-w-[980px]
                    min-[1180px]:w-full min-[1180px]:max-w-none
                    h-auto
                    -rotate-3
                    mx-auto
                    min-[1180px]:mx-0
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
              <div
                id='project-description-anchor'
                className='mt-8 min-[1180px]:mt-16 min-[1180px]:col-start-1 min-[1180px]:col-span-9'
              >
                <p className='text-2xl leading-tight tracking-tight sm:text-3xl min-[1180px]:text-4xl max-w-7xl'>
                  {project.description}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        {project.content && (
          <section className='mb-16 min-[1180px]:mb-24'>
            <ContentRenderer content={project.content} />
          </section>
        )}

        {/* Category sections */}
        {project.categorySections && project.categorySections.length > 0 && (
          <section className='space-y-20 min-[1180px]:space-y-24'>
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
        <section className='mt-16 min-[1180px]:my-32' data-credits-section>
          <ProjectCredits
            credits={project.credits}
            press={project.press}
            tournee={project.tournee}
          />
        </section>

        {(prevProject || nextProject) && (
          <nav className='min-[1180px]:hidden' aria-label='Adjacent productions'>
            <ProjectNavigation
              prevProject={prevProject}
              nextProject={nextProject}
            />
          </nav>
        )}
      </div>
    </main>
  )
}
