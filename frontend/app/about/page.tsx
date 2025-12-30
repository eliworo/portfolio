import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutPageQuery } from '@/sanity/lib/queries'
import type { AboutPageQueryResult } from '@/sanity.types'
import ContactNav from '@/app/components/ContactNav'
import { Metadata, ResolvingMetadata } from 'next'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'

export async function generateMetadata(
  _props: any,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: aboutPage } = await sanityFetch({
    query: aboutPageQuery,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(aboutPage?.logo)

  return {
    title: 'About',
    description: aboutPage?.bio
      ? typeof aboutPage.bio === 'string'
        ? aboutPage.bio
        : undefined
      : undefined,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function AboutPage() {
  const { data } = await sanityFetch({
    query: aboutPageQuery,
  })

  const aboutPage = data as AboutPageQueryResult

  if (!aboutPage) {
    return null
  }

  // 1. SPLIT THE BIO LOGIC
  const bioBlocks = Array.isArray(aboutPage.bio) ? aboutPage.bio : []
  const bioPart1 = bioBlocks.slice(0, 4)
  const bioPart2 = bioBlocks.slice(4)

  // 2. DEFINE SHARED STYLING
  const portableTextComponents = {
    block: {
      normal: ({ children }: any) => (
        <p className='mb-4 lg:mb-8 whitespace-pre-line'>{children}</p>
      ),
    },
  }

  // 3. DEFINE ARTEOS CONTENT (To avoid code duplication)
  const ArteosContent = () => (
    <>
      {/* Logo */}
      {aboutPage.arteosLogo?.asset?.url && (
        <div className='absolute -left-2 -top-14 lg:left-auto lg:top-auto lg:relative z-10'>
          <Image
            src={aboutPage.arteosLogo.asset.url}
            alt='Arteos Logo'
            width={100}
            height={1000}
            className='w-auto h-44 lg:h-64 object-contain'
          />
        </div>
      )}
      {/* Description Box */}
      <div className='bg-black rounded-[2px] px-6 lg:px-6 py-6 lg:py-8 relative lg:absolute lg:left-44 lg:top-16 w-[65vw] lg:max-w-[17vw] ml-28 lg:ml-0 mt-40 lg:mt-0'>
        <div className='max-w-full lg:max-w-74 bg-white text-black rounded-[2px] -rotate-6 p-4'>
          <p className='text-sm lg:text-base leading-[1.15]'>
            {aboutPage.arteosDescription}
          </p>
        </div>
      </div>
    </>
  )

  return (
    <main className='w-full min-h-screen relative overflow-hidden'>
      {aboutPage.quote && (
        <div className='text-base lg:text-2xl leading-tight lg:max-w-[60vw] lg:ml-132 mt-70 mb-8 lg:mb-0 px-8 pl-20 lg:px-8 lg:mt-32'>
          <p>&ldquo;{aboutPage.quote}&rdquo;</p>
        </div>
      )}
      {aboutPage.logo?.asset?.url && (
        <div className='mb-8 absolute left-8 lg:left-12 top-24 lg:top-12 -rotate-4 z-20'>
          <Image
            src={aboutPage.logo.asset.url}
            alt='About Logo'
            width={600}
            height={200}
            className='object-contain w-auto h-[150px] lg:h-[200px]'
          />
        </div>
      )}

      <div className='lg:container mx-auto lg:px-8 lg:py-24 relative'>
        {/* TOP SECTION: 2 COLUMNS */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
          {/* LEFT COL: IMAGE */}
          <div className='relative'>
            {aboutPage.profileImage?.asset?.url && (
              <div className='relative -ml-24 lg:-mt-16 lg:ml-8 group'>
                <Image
                  src={aboutPage.profileImage.asset.url}
                  alt={aboutPage.profileImage.alt || 'Profile Image'}
                  width={400}
                  height={600}
                  className='w-[80vw] lg:w-full lg:max-w-lg h-auto object-cover'
                />
                {aboutPage.profileImage.credit && (
                  <p className='text-xs text-gray-600 mt-2 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    {aboutPage.profileImage.credit}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COL: BIO PART 1 */}
          <div className='space-y-12 -mt-124 px-4 lg:mt-0 lg:-ml-80 z-10 w-full lg:max-w-[30vw]'>
            {bioPart1.length > 0 && (
              <div className='text-sm lg:text-xl max-w-none leading-tight pl-34 lg:px-0'>
                <PortableText
                  value={bioPart1}
                  components={portableTextComponents}
                />
              </div>
            )}

            {/* ARTEOS (DESKTOP ONLY) */}
            {/* Added 'hidden lg:block' to hide this instance on mobile */}
            <div className='hidden lg:block relative lg:absolute lg:right-60 lg:top-16 lg:mt-0 -mt-16'>
              <ArteosContent />
            </div>
          </div>
        </div>

        {/* BIO PART 2 (Flows underneath image) */}
        {bioPart2.length > 0 && (
          <div className='mt-0 lg:mt-16 px-16 lg:px-64 lg:max-w-7xl max-w-none w-full text-sm lg:text-xl leading-tight'>
            <PortableText
              value={bioPart2}
              components={portableTextComponents}
            />
          </div>
        )}

        {/* ARTEOS (MOBILE ONLY) */}
        {/* Added this block: 'block lg:hidden' shows it only on mobile, placed after everything */}
        <div className='block lg:hidden relative mt-16 mb-24 max-w-[90vw] mx-auto'>
          <ArteosContent />
        </div>
      </div>

      <ContactNav
        contact={aboutPage.contact}
        cv={aboutPage.cv}
        contactImageUrl={aboutPage.contactImage?.asset?.url}
      />
    </main>
  )
}
