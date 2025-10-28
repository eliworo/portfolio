import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/live'
import { allProjectsByCategoryQuery } from '@/sanity/lib/queries'

export default async function WorksByCategoryPage() {
  const { data } = await sanityFetch({ query: allProjectsByCategoryQuery })
  const { categories, projects } = data

  // Group projects by category
  const projectsByCategory = categories
    .map((category) => {
      // Find all projects that belong to this category
      const categoryProjects = projects.filter((project) => {
        // Check personal projects (categories array)
        const inPersonalCategories = project.categories?.some(
          (cat) => cat._id === category._id
        )

        // Check professional projects (categorySections)
        const inProfessionalSections = project.categorySections?.some(
          (section) => section.category?._id === category._id
        )

        return inPersonalCategories || inProfessionalSections
      })

      return {
        category,
        projects: categoryProjects,
      }
    })
    .filter((item) => item.projects.length > 0) // Only keep categories with projects

  return (
    <main className='py-12 px-4'>
      {/* Title - Static Image */}
      <div className='absolute left-22 top-16'>
        <Image
          src='/images/ByCategory.png'
          alt='BY CATEGORY'
          width={600}
          height={200}
          style={{
            objectFit: 'contain',
            width: 'auto',
            maxHeight: '400px',
          }}
          className='-rotate-0'
        />
      </div>

      <div className='pl-64 mt-32'>
        {/* Show projects grouped by category */}
        <div className='space-y-24'>
          {projectsByCategory.map(({ category, projects }) => (
            <div key={category._id} className='category-section'>
              <h2 className='text-2xl mb-8 font-agrandir-bold'>
                {category.titleImage?.asset?.url ? (
                  <Image
                    src={category.titleImage.asset.url}
                    alt={category.title}
                    width={300}
                    height={80}
                    className='h-16 w-auto object-contain'
                  />
                ) : (
                  category.title
                )}
              </h2>

              {/* Projects Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {projects.map((project) => (
                  <ProjectCard
                    key={`${category._id}-${project._id}`}
                    project={project}
                    categoryId={category._id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function ProjectCard({ project, categoryId }) {
  // Build the correct link based on project type
  const isPersonalProject = project.projectKind === 'personal'

  // For personal projects, link to project page
  // For professional projects, link to project page with category section hash
  const href = isPersonalProject
    ? `/works/${project.projectType.slug}/${project.slug}`
    : `/works/${project.projectType.slug}/${project.slug}#category-${categoryId}`

  return (
    <Link href={href} className='group block'>
      <div className='overflow-hidden shadow-md hover:shadow-xl transition-all duration-300'>
        {project.coverImage?.asset?.url && (
          <div className='aspect-[4/3] relative'>
            {/* Cover Image */}
            <Image
              src={project.coverImage.asset.url}
              alt={project.coverImage.alt || project.title}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover group-hover:scale-105 transition-transform duration-500'
            />

            {/* Title image overlay */}
            {project.titleImage?.asset?.url && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <Image
                  src={project.titleImage.asset.url}
                  alt={project.title}
                  width={200}
                  height={80}
                  className='drop-shadow-md max-w-[80%] max-h-[60%] object-contain'
                />
              </div>
            )}

            {/* Year tag */}
            {project.year && (
              <div className='absolute bottom-4 right-4 bg-white/80 px-3 py-1 text-sm font-medium'>
                {project.year}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
