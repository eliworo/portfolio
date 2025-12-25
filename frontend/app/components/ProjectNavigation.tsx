'use client'

import Image from 'next/image'
import Link from 'next/link'

type NavigationProject = {
  title: string
  slug: string
  titleImageUrl?: string
}

export function ProjectNavigation({
  prevProject,
  nextProject,
}: {
  prevProject?: NavigationProject
  nextProject?: NavigationProject
}) {
  return (
    <div className='xl:fixed xl:bottom-8 xl:left-16 justify-between mt-8 w-full flex xl:flex-col gap-4'>
      {/* Previous Project */}
      <div>
        {prevProject ? (
          <Link
            href={`/productions/${prevProject.slug}`}
            className='group items-center hover:opacity-70 transition-opacity'
          >
            <Image
              src='/images/arrowLeftLogo.png'
              alt='Previous Project'
              width={600}
              height={600}
              className='object-contain h-auto w-16 select-none pointer-events-none'
            />
            {prevProject.titleImageUrl && (
              <Image
                src={prevProject.titleImageUrl}
                alt={prevProject.title}
                width={200}
                height={28}
                className='object-contain h-7 w-auto'
                unoptimized
              />
            )}
          </Link>
        ) : (
          <div className='opacity-0'>←</div>
        )}
      </div>

      {/* Next Project */}
      {nextProject ? (
        <Link
          href={`/productions/${nextProject.slug}`}
          className='group items-start hover:opacity-70 transition-opacity'
        >
          {nextProject.titleImageUrl && (
            <Image
              src={nextProject.titleImageUrl}
              alt={nextProject.title}
              width={200}
              height={28}
              className='object-contain h-7 w-auto'
              unoptimized
            />
          )}
          <Image
            src='/images/arrowRightLogo.png'
            alt='Next'
            width={600}
            height={600}
            className='object-contain h-auto w-16 select-none pointer-events-none'
          />
        </Link>
      ) : (
        <div className='opacity-0'>→</div>
      )}
    </div>
  )
}
