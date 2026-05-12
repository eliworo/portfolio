import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { projectQuery } from '@/sanity/lib/queries'
import { ContentRenderer } from '@/app/components/ContentRenderer'
import CategoryNav from '@/app/components/CategoryNav'
import { ProjectCredits } from '@/app/components/ProjectCredits'
import ScrollToHash from '@/app/components/ScrollToHash'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import ProjectSectionsStackedNavClient from '@/app/components/ProjectSectionsStackedNavClient'
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

  const useStackedTitles = true

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

      <div className='px-8 pt-32 sm:pt-20 min-[1180px]:pt-16'>
        <header className='mb-10 min-[1180px]:mb-16'>
          <div className='min-[1180px]:grid min-[1180px]:grid-cols-12 min-[1180px]:gap-x-10 min-[1180px]:items-start'>
            {project?.titleImage?.asset?.url && (
              <div className='min-[1180px]:col-span-8 min-[1180px]:-ml-44'>
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
              </div>
            )}

            {project.description && (
              <div className='mt-8 min-[1180px]:mt-16 min-[1180px]:col-start-1 min-[1180px]:col-span-9'>
                <p className='text-2xl leading-tight tracking-tight sm:text-3xl min-[1180px]:text-4xl max-w-7xl'>
                  {project.description}
                </p>
              </div>
            )}
          </div>
        </header>

        {project.content && (
          <section className='mb-16 min-[1180px]:mb-24'>
            <ContentRenderer content={project.content} />
          </section>
        )}

        {project.categorySections && project.categorySections.length > 0 && (
          <section className='space-y-20 min-[1180px]:space-y-24'>
            {project.categorySections.map((section) => (
              <section
                key={section.category._id}
                id={section.category.slug.current}
                className='scroll-mt-[110px]'
              >
                <div data-section-sentinel className='h-px w-px' />
                <ContentRenderer content={section.content} />
              </section>
            ))}
          </section>
        )}

        <section className='mt-16 min-[1180px]:my-32' data-credits-section>
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
