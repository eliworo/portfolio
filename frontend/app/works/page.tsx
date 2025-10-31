import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { worksPageQuery } from '@/sanity/lib/queries'
import FilterableProjectsList from '@/app/components/FilterableProjectsList'
import Link from 'next/link'

export default async function WorksPage() {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
  })

  if (!worksPage) {
    return null
  }

  return (
    <main className='w-full pl-60 pr-8'>
      {worksPage.titleImage?.asset?.url && (
        <div className='mb-8 fixed left-22 top-16 -rotate-3'>
          <Image
            src={worksPage.titleImage.asset.url}
            alt='WORKS'
            width={600}
            height={200}
            style={{
              objectFit: 'contain',
              width: 'auto',
              maxHeight: '200px',
            }}
          />
        </div>
      )}

      <div className='flex w-full'>
        <div className='w-full'></div>
        {/* Description - check existence */}
        {worksPage.description && (
          <div className='text-black/85 text-2xl leading-snug font-agrandir-tight mb-12 w-full columns-1 py-32'>
            <PortableText value={worksPage.description} />
          </div>
        )}
      </div>

      {worksPage?.featuredProjects && worksPage.featuredProjects.length > 0 && (
        <div className='columns-[400px] gap-2'>
          {worksPage.featuredProjects.map((project) => {
            const href =
              project.projectType?.slug?.current && project.slug?.current
                ? `/${project.projectType.slug.current}/p/${project.slug.current}`
                : '#'

            return (
              <Link
                key={project._id}
                href={href}
                className='block'
                style={{
                  marginBottom: `${Math.random() * 20 + 10}px`,
                  marginLeft: `${Math.random() * 10}px`,
                  marginRight: `${Math.random() * 10}px`,
                }}
              >
                {project.coverImage?.asset?.url && (
                  <Image
                    src={project.coverImage.asset.url}
                    alt={project.coverImage.alt || project.title || ''}
                    width={300}
                    height={400}
                    className='w-full h-auto object-cover'
                  />
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Featured Projects */}
      {/* {worksPage?.featuredProjects && worksPage.featuredProjects.length > 0 && (
        <FilterableProjectsList
          projects={worksPage.featuredProjects}
          isFeaturedProjectsPage={true}
        />
      )} */}
    </main>
  )
}
