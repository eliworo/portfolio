import Image from 'next/image'
import { sanityFetch } from '@/sanity/lib/live'
import { commissionsPageQuery } from '@/sanity/lib/queries'
import type { CommissionsPageQueryResult } from '@/sanity.types'
import ToolCard from '@/app/components/ToolCard'

export default async function CommissionsPage() {
  const { data } = await sanityFetch({
    query: commissionsPageQuery,
  })

  const commissionsPage = data as CommissionsPageQueryResult

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
        <div className='text-base xl:text-2xl leading-tight xl:max-w-[60vw] xl:ml-180 mt-60 mb-8 xl:mb-0 px-8 xl:mt-32'>
          <p>{commissionsPage.quote}</p>
        </div>
      )}

      {/* Tools Grid */}
      <div className='xl:pl-60 3xl:pl-88 mt-12 px-8 pb-32'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-16 3xl:gap-32'>
          {commissionsPage.tools?.map((tool, index) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  )
}
