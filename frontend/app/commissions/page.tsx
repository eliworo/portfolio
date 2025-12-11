import Image from 'next/image'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutPageQuery, commissionsPageQuery } from '@/sanity/lib/queries'
import type { CommissionsPageQueryResult } from '@/sanity.types'
import ToolCard from '@/app/components/ToolCard'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import ContactNav from '../components/ContactNav'

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
    description: commissionsPage?.quote,
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

  if (!commissionsPage) {
    return null
  }

  return (
    <main className='w-full min-h-screen relative overflow-hidden'>
      {commissionsPage.titleImage?.asset?.url && (
        <div className='xl:mb-8 absolute left-12 top-28 sm:top-20 md:top-14 lg:top-8 xl:top-12 -rotate-0 z-20'>
          <Image
            src={commissionsPage.titleImage.asset.url}
            alt='Commissions'
            width={1000}
            height={1000}
            className='object-contain w-[80vw] h-auto xl:w-auto xl:h-[180px]'
          />
        </div>
      )}

      {/* Quote */}
      {commissionsPage.quote && (
        <div className='text-base xl:text-2xl leading-tight xl:max-w-[60vw] xl:ml-180 mt-62 mb-8 xl:mb-0 px-8 xl:mt-32'>
          {/* ADDED: whitespace-pre-line 
             This respects the "Enter" keys (newlines) from the Sanity text field.
          */}
          <p className='whitespace-pre-line'>{commissionsPage.quote}</p>
        </div>
      )}

      {/* Tools Grid */}
      <div className='xl:pl-60 3xl:pl-88 mt-8 xl:mt-12 px-8 pb-32'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-16 3xl:gap-32'>
          {commissionsPage.tools?.map((tool, index) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </div>
      </div>
      <ContactNav
        contact={aboutPage?.contact ?? null}
        cv={aboutPage?.cv}
        contactImageUrl={aboutPage?.contactImage?.asset?.url}
      />
    </main>
  )
}
