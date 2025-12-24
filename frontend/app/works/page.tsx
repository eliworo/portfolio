import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import {
  worksPageQuery,
  productionsPageQuery,
  studioWorksQuery,
} from '@/sanity/lib/queries'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import PaintBrush from '../components/drawings/PaintBrush'

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(worksPage?.titleImage)

  const description = worksPage?.description
    ? worksPage.description
        .map(
          (block: any) =>
            block.children?.map((child: any) => child.text || '').join('') || ''
        )
        .join(' ')
        .trim()
    : undefined

  return {
    title: 'Works',
    description,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function WorksPage() {
  const { data: worksPage } = await sanityFetch({
    query: worksPageQuery,
  })

  const { data: productionsPage } = await sanityFetch({
    query: productionsPageQuery,
  })

  const { data: studioWorksPage } = await sanityFetch({
    query: studioWorksQuery,
  })

  if (!worksPage) {
    return null
  }

  return (
    <main className='w-full'>
      {worksPage.titleImage?.asset?.url && (
        <div className='mb-8 absolute left-1/2 -translate-x-1/2 top-30 lg:left-22 lg:top-16 -rotate-3 z-10 w-[85vw] lg:w-[40vw] lg:translate-x-0'>
          <Image
            src={worksPage.titleImage.asset.url}
            alt='WORKS'
            width={600}
            height={200}
            className='object-contain w-auto h-[140px] lg:h-[200px]'
          />
        </div>
      )}

      <div className='flex w-full px-2 lg:px-16'>
        <div className='hidden lg:block w-full'></div>
        {worksPage.description && (
          <div className='text-lg mt-60 py-16 lg:mt-0 lg:text-2xl leading-[1.15] font-rader lg:mb-12 w-full columns-1 lg:py-32 lg:px-0 lg:pl-8 lg:max-w-3xl'>
            <PortableText
              value={worksPage.description}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className='mb-4 whitespace-pre-line'>{children}</p>
                  ),
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Productions and Studio Works Side by Side */}
      <div className='px-4 lg:px-16 mb-20 lg:mb-32'>
        <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Productions Section */}
          <Link
            href='/productions'
            className='block group hover:opacity-95 transition-opacity'
          >
            <div className='h-full flex flex-col'>
              <div className='flex-1 flex flex-col justify-center items-start p-8 lg:p-12'>
                {productionsPage?.titleImage?.asset?.url && (
                  <div className='mb-6 lg:mb-8 w-full max-w-sm transition-transform relative'>
                    {/* Paintbrush Background */}
                    <div className='absolute inset-0 -z-10 flex items-start justify-center'>
                      <PaintBrush
                        className='w-full h-full max-w-md'
                        theme={{ fill: '#FFB6C1' }}
                      />
                    </div>
                    <Image
                      src={productionsPage.titleImage.asset.url}
                      alt='Productions'
                      width={500}
                      height={200}
                      className='object-contain w-full h-auto'
                    />
                  </div>
                )}
                <p className='text-base lg:text-lg leading-[1.15] font-rader'>
                  Full-scale productions developed through in-depth research,
                  exploring contemporary societal issues through a performative
                  approach, immersive installations, embodied fashion, words,
                  and visual arts.
                </p>
              </div>
            </div>
          </Link>

          {/* Studio Works Section */}
          <Link
            href='/studio-works'
            className='block group hover:opacity-95 transition-opacity'
          >
            <div className=' h-full flex flex-col'>
              <div className='flex-1 flex flex-col justify-center items-start p-8 lg:p-12'>
                {studioWorksPage?.titleImage?.asset?.url && (
                  <div className='mb-6 lg:mb-8 w-full max-w-sm transition-transform relative'>
                    {/* Paintbrush Background */}
                    <div className='absolute inset-0 -z-10 flex items-center justify-center'>
                      <PaintBrush
                        className='w-full h-full max-w-md'
                        theme={{ fill: '#98D8C8' }}
                      />
                    </div>
                    <Image
                      src={studioWorksPage.titleImage.asset.url}
                      alt='Studio Works'
                      width={500}
                      height={200}
                      className='object-contain w-full h-auto'
                    />
                  </div>
                )}
                <p className='text-base lg:text-lg leading-[1.15] font-rader'>
                  Inside the studio: independent standalone works and fragments
                  from larger productions, spanning fashion, photography,
                  installation, writing, performance, ink, painting, sculpture,
                  and music.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
