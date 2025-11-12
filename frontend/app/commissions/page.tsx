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
        <div className='mb-8 fixed left-12 top-12 -rotate-0 z-20'>
          <Image
            src={commissionsPage.titleImage.asset.url}
            alt='Commissions'
            width={1000}
            height={1000}
            className='object-contain w-auto h-[150px] lg:h-[180px]'
          />
        </div>
      )}

      {/* Quote */}
      {commissionsPage.quote && (
        <div className='text-base lg:text-2xl leading-tight lg:max-w-[60vw] lg:ml-180 mt-58 mb-8 lg:mb-0 px-8 lg:mt-32'>
          <p>&ldquo;{commissionsPage.quote}&rdquo;</p>
        </div>
      )}

      {/* Tools Grid */}
      <div className='lg:pl-88 mt-12 px-8 pb-32'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-32'>
          {commissionsPage.tools?.map((tool, index) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  )
}
