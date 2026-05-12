'use client'

import Image from 'next/image'
import Link from 'next/link'
import PaintedTitleImage from './PaintedTitleImage'

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
    <div className='min-[1180px]:fixed min-[1180px]:bottom-8 min-[1180px]:left-0 justify-between mt-8 w-full flex min-[1180px]:px-16 gap-4 pointer-events-none'>
      {/* Previous Project */}
      <div>
        {prevProject ? (
          <Link
            href={`/productions/${prevProject.slug}`}
            className='group items-start opacity-50 hover:opacity-100 transition-opacity pointer-events-auto flex flex-col space-y-1'
          >
            {prevProject.titleImageUrl && (
              <PaintedTitleImage
                src={prevProject.titleImageUrl}
                alt={prevProject.title}
                width={200}
                height={28}
                sizes='200px'
                wrapperClassName='min-h-7 min-[1180px]:min-h-8'
                className='object-contain h-7 min-[1180px]:h-8 w-auto'
              />
            )}
            <Image
              src='/images/optimized/arrowLeftLogo-180.webp'
              alt='Previous Project'
              width={180}
              height={100}
              className='object-contain h-auto w-8 select-none pointer-events-none'
            />
          </Link>
        ) : (
          <div className='opacity-0'>←</div>
        )}
      </div>

      {/* Next Project */}
      {nextProject ? (
        <Link
          href={`/productions/${nextProject.slug}`}
          className='group items-end opacity-50 hover:opacity-100 transition-opacity pointer-events-auto flex flex-col space-y-1'
        >
          {nextProject.titleImageUrl && (
            <PaintedTitleImage
              src={nextProject.titleImageUrl}
              alt={nextProject.title}
              width={200}
              height={28}
              sizes='200px'
              wrapperClassName='min-h-7 min-[1180px]:min-h-8'
              className='object-contain h-7 min-[1180px]:h-8 w-auto'
            />
          )}
          <Image
            src='/images/optimized/arrowRightLogo-180.webp'
            alt='Next'
            width={180}
            height={106}
            className='object-contain h-auto w-8 select-none pointer-events-none'
          />
        </Link>
      ) : (
        <div className='opacity-0'>→</div>
      )}
    </div>
  )
}
