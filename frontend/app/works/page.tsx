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
// import PaintBrush from '../components/drawings/PaintBrush'

function drift(seed: string, range = 24) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }

  return {
    x: (hash % range) - range / 2,
    y: ((hash >> 3) % range) - range / 2,
  }
}

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
  const [
    { data: worksPage },
    { data: productionsPage },
    { data: studioWorksPage },
  ] = await Promise.all([
    sanityFetch({ query: worksPageQuery }),
    sanityFetch({ query: productionsPageQuery }),
    sanityFetch({ query: studioWorksQuery }),
  ])

  if (!worksPage) return null

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      {/* HEADER — match Commissions behavior */}
      <header className='px-4 pt-16 sm:pt-20 md:pt-16 xl:pt-10'>
        <div className='xl:grid xl:grid-cols-12 xl:gap-x-16 xl:items-center'>
          {/* Title image: in-flow, anchored left on desktop */}
          {worksPage.titleImage?.asset?.url && (
            <div className='xl:col-span-5 xl:row-start-1 ml-20 mt-4'>
              <Image
                src={worksPage.titleImage.asset.url}
                alt='Works'
                width={1000}
                height={500}
                priority
                className='
                  object-contain mx-auto mt-18 mb-8 xl:my-0 object-left
                  max-h-[200px]
                  xl:w-full xl:max-w-none
                '
              />
            </div>
          )}

          {/* Description: below on mobile, right column on desktop */}
          {worksPage.description && (
            <div
              className='
                mt-10
                xl:mt-16
                xl:col-start-7 xl:col-span-6
                xl:row-start-1
                xl:max-w-[80ch]
              '
            >
              <div className='text-xl xl:text-2xl leading-[1.15]'>
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
            </div>
          )}
        </div>
      </header>{' '}
      <div className='absolute top-1/2 -translate-y-1/3 left-1/2 -z-10 group'>
        <Image
          src='/images/eli.JPG'
          alt={'Profile Image'}
          width={400}
          height={600}
          className='w-auto max-h-[50vh] object-cover z-0'
        />
      </div>
      {/* Productions and Studio Works Side by Side */}
      <section className='relative px-4 lg:px-16 xl:pl-54 mb-20 lg:mb-32 mt-14 xl:mt-20'>
        <div className='w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
          {/* Productions */}
          <Link
            href='/productions'
            className='block group hover:opacity-95 transition-opacity'
          >
            <div className='h-full flex flex-col'>
              <div className='flex-1 flex flex-col justify-start items-start p-8 lg:p-12'>
                {productionsPage?.titleImage?.asset?.url && (
                  <div className='mb-6 lg:mb-8 w-full relative'>
                    <Image
                      src={productionsPage.titleImage.asset.url}
                      alt='Productions'
                      width={500}
                      height={500}
                      className='object-contain w-full max-h-[60px] h-auto object-left'
                    />
                  </div>
                )}
                <p className='text-base lg:text-2xl leading-[1.15]'>
                  <span className='font-rader-bold text-[26px]'>
                    Full-scale productions.
                  </span>{' '}
                  Developed through in-depth research, exploring contemporary
                  societal issues through a performative approach, immersive
                  installations, embodied fashion, words, and visual arts.
                </p>
              </div>
            </div>
          </Link>

          {/* Studio Works */}
          <Link
            href='/studio-works'
            className='block group hover:opacity-95 transition-opacity'
          >
            <div className='h-full flex flex-col'>
              <div className='flex-1 flex flex-col justify-center items-start p-8 lg:p-12 xl:pt-32'>
                {studioWorksPage?.titleImage?.asset?.url && (
                  <div className='mb-6 lg:mb-8 w-full relative'>
                    <Image
                      src={studioWorksPage.titleImage.asset.url}
                      alt='Studio Works'
                      width={500}
                      height={500}
                      className='object-contain w-full max-h-[60px] h-auto object-left'
                    />
                  </div>
                )}
                <p className='text-base lg:text-2xl leading-[1.15]'>
                  <span className='font-rader-bold text-[26px]'>
                    Inside the studio.
                  </span>{' '}
                  Independent standalone works and fragments from larger
                  productions, spanning fashion, photography, installation,
                  writing, performance, ink, painting, sculpture, and music.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  )
}
