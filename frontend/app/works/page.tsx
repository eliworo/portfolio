import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import {
  worksPageQuery,
  productionsPageQuery,
  studioWorksQuery,
} from '@/sanity/lib/queries'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import PortableLinkMark from '@/app/components/portable/PortableLinkMark'
import BrushStrongMark from '@/app/components/portable/BrushStrongMark'

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata,
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
            block.children?.map((child: any) => child.text || '').join('') ||
            '',
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

  const introPortableComponents: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className='mb-4 whitespace-pre-line'>{children}</p>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <BrushStrongMark seed='works-intro-strong'>{children}</BrushStrongMark>
      ),
      link: ({ children, value }) => (
        <PortableLinkMark value={value as any}>{children}</PortableLinkMark>
      ),
    },
  }

  const previewPortableComponents: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className='mb-3 whitespace-pre-line'>{children}</p>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <BrushStrongMark seed='works-preview-strong'>{children}</BrushStrongMark>
      ),
      link: ({ children, value }) => (
        <PortableLinkMark value={value as any}>{children}</PortableLinkMark>
      ),
    },
  }

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      <header className='px-4 pt-16 sm:pt-20 md:pt-16 xl:pt-12'>
        <div className='xl:ml-20 xl:max-w-[760px]'>
          {worksPage.titleImage?.asset?.url && (
            <div className='mt-4'>
              <Image
                src={worksPage.titleImage.asset.url}
                alt='Works'
                width={1000}
                height={500}
                priority
                className='
                  object-contain mx-auto mt-18 mb-4 xl:my-0 object-left px-2 xl:px-0
                  max-h-[200px]
                  xl:w-full xl:max-w-none
                '
              />
            </div>
          )}

          {worksPage.description && (
            <div className='mt-6 xl:mt-8 px-2 xl:px-0 xl:w-full xl:ml-[360px]'>
              <div className='text-lg xl:text-2xl leading-tight font-sans max-w-[80ch]'>
                <PortableText
                  value={worksPage.description}
                  components={introPortableComponents}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <section className='relative px-4 xl:px-20 mb-20 mt-8 xl:mt-12'>
        <div className='w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-2 xl:max-w-[1400px] xl:ml-40'>
          {/* Productions */}
          <div className='block group hover:opacity-95 transition-opacity rounded-md'>
            <div className='h-full flex flex-col'>
              <div className='relative flex-1 flex flex-col justify-start items-start p-4 lg:p-6 pb-12'>
                {productionsPage?.titleImage?.asset?.url && (
                  <div className='mb-4 lg:mb-8 w-full relative rotate-1'>
                    <Image
                      src={productionsPage.titleImage.asset.url}
                      alt='Productions'
                      width={500}
                      height={500}
                      className='object-contain w-full max-h-[130px] h-auto object-left'
                    />
                  </div>
                )}
                <div className='text-sm xl:text-xl leading-tight'>
                  <PortableText
                    value={worksPage.productionsPreviewText || []}
                    components={previewPortableComponents}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Studio Works */}
          <div className='block group hover:opacity-95 transition-opacity rounded-md'>
            <div className='h-full flex flex-col'>
              <div className='relative flex-1 flex flex-col justify-start items-start p-4 lg:p-6 pb-12'>
                {studioWorksPage?.titleImage?.asset?.url && (
                  <div className='mb-4 lg:mb-8 w-full relative'>
                    <Image
                      src={studioWorksPage.titleImage.asset.url}
                      alt='Studio Works'
                      width={500}
                      height={500}
                      className='object-contain w-full max-h-[130px] h-auto object-left'
                    />
                  </div>
                )}
                <div className='text-sm xl:text-xl leading-tight'>
                  <PortableText
                    value={worksPage.studioWorksPreviewText || []}
                    components={previewPortableComponents}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
