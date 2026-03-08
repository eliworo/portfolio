import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutPageQuery, commissionsPageQuery } from '@/sanity/lib/queries'
import type { CommissionsPageQueryResult } from '@/sanity.types'
import ToolCard from '@/app/components/ToolCard'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import ContactNav from '../components/ContactNav'
import PortableLinkMark from '@/app/components/portable/PortableLinkMark'
import BrushStrongMark from '@/app/components/portable/BrushStrongMark'

function toPlainText(blocks: any): string | undefined {
  if (!Array.isArray(blocks)) {
    return undefined
  }

  const text = blocks
    .filter((block) => block?._type === 'block' && Array.isArray(block.children))
    .map((block) =>
      block.children
        .filter((child: any) => child?._type === 'span' && typeof child.text === 'string')
        .map((child: any) => child.text)
        .join('')
    )
    .join(' ')
    .trim()

  return text || undefined
}

const quotePortableComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className='mb-4 last:mb-0 whitespace-pre-line text-lg xl:text-2xl leading-snug'>
        {children ?? null}
      </p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className='mb-4 last:mb-0 whitespace-pre-line text-lg xl:text-2xl leading-snug italic'>
        {children ?? null}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <BrushStrongMark seed='commissions-quote-strong'>
        {children ?? null}
      </BrushStrongMark>
    ),
    link: ({
      children,
      value,
    }: {
      children?: React.ReactNode
      value?: any
    }) => <PortableLinkMark value={value}>{children ?? null}</PortableLinkMark>,
  },
}

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: commissionsPage } = await sanityFetch({
    query: commissionsPageQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(commissionsPage?.titleImage)

  return {
    title: 'Commissions',
    description: toPlainText(commissionsPage?.quote),
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function CommissionsPage() {
  const [{ data: commissionsPage }, { data: aboutPage }] = await Promise.all([
    sanityFetch({ query: commissionsPageQuery }),
    sanityFetch({ query: aboutPageQuery }),
  ])

  if (!commissionsPage) return null

  return (
    <main className='w-full min-h-screen overflow-hidden'>
      {/* HEADER (12-col grid, keeps the original poster-like composition) */}
      <header className='px-8 pt-16 sm:pt-20 md:pt-16 xl:pt-10'>
        <div className='xl:grid xl:grid-cols-12 xl:gap-x-16'>
          {/* Title image: anchored top-left, in flow */}
          {commissionsPage.titleImage?.asset?.url && (
            <div className='xl:col-span-6 xl:row-start-1'>
              <Image
                src={commissionsPage.titleImage.asset.url}
                alt='Commissions'
                width={1000}
                height={500}
                priority
                className='
                          object-contain mx-auto mt-18 mb-4 xl:mt-8 xl:mb-0
                          w-[80vw] max-w-[980px]
                          xl:w-[90%] xl:max-w-none
                          h-auto
                        '
              />
            </div>
          )}

          {/* Quote: sits UNDER the title, but starts later (shift right) */}
          {Array.isArray(commissionsPage.quote) && commissionsPage.quote.length > 0 && (
            <div
              className='
                mt-6
                xl:mt-10
                xl:col-start-7 xl:col-span-5
                xl:row-start-1
                xl:max-w-[70ch]
              '
            >
              <PortableText
                value={commissionsPage.quote}
                components={quotePortableComponents}
              />
            </div>
          )}
        </div>
      </header>

      {/* TOOLS GRID */}
      <section className='px-2 pb-48 mt-14 xl:mt-20 xl:pl-60 3xl:pl-88'>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-16 xl:gap-y-24 3xl:gap-32'>
          {commissionsPage.tools?.map((tool: NonNullable<NonNullable<CommissionsPageQueryResult>['tools']>[number], index: number) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </div>
      </section>

      <ContactNav
        contact={aboutPage?.contact ?? null}
        cv={aboutPage?.cv}
        contactImageUrl={aboutPage?.contactImage?.asset?.url}
      />
    </main>
  )
}
