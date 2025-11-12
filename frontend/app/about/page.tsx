import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutPageQuery } from '@/sanity/lib/queries'
import type { AboutPageQueryResult } from '@/sanity.types'
import { FiInstagram, FiFacebook } from 'react-icons/fi'
import { BiLogoFacebookSquare } from 'react-icons/bi'

export default async function AboutPage() {
  const { data } = await sanityFetch({
    query: aboutPageQuery,
  })

  const aboutPage = data as AboutPageQueryResult

  if (!aboutPage) {
    return null
  }

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
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-start'>
          <div className='relative'>
            {aboutPage.profileImage?.asset?.url && (
              <div className='relative -ml-24 lg:-mt-16 lg:ml-8'>
                <Image
                  src={aboutPage.profileImage.asset.url}
                  alt={aboutPage.profileImage.alt || 'Profile Image'}
                  width={400}
                  height={600}
                  className='w-[80vw] lg:w-full lg:max-w-lg h-auto object-cover'
                />
              </div>
            )}
          </div>

          <div className='space-y-12 -mt-124 px-4 lg:mt-0 lg:-ml-80 z-10 w-full lg:max-w-[30vw]'>
            {aboutPage.bio && (
              <div className='text-sm lg:text-xl max-w-none leading-tight pl-34 lg:px-0'>
                <PortableText value={aboutPage.bio} />
              </div>
            )}
            <div className='relative lg:absolute lg:right-60 lg:top-0 lg:mt-0 -mt-16'>
              {/* Logo - Absolutely positioned on left on mobile */}
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
              <div className='bg-black rounded-lg px-6 lg:px-8 py-6 lg:py-8 relative lg:absolute lg:left-44 lg:top-16 w-[65vw] lg:w-[20vw] ml-28 lg:ml-0 mt-40 lg:mt-0'>
                <div className='max-w-full lg:max-w-74 bg-white text-black rounded-lg -rotate-6 p-4 lg:p-5'>
                  <p className='text-sm lg:text-base leading-tight'>
                    {aboutPage.arteosDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className='lg:absolute lg:right-0 lg:bottom-0'>
              {aboutPage.contactImage?.asset?.url && (
                <div className='z-10 relative lg:-ml-44'>
                  <Image
                    src={aboutPage.contactImage.asset.url}
                    alt='Contact Image'
                    width={1000}
                    height={1000}
                    className='w-auto h-24 lg:h-32 object-contain'
                  />
                </div>
              )}

              <div className='space-y-4 pb-8'>
                <div className='flex flex-col lg:flex-row lg:items-center gap-1 items-start ml-4'>
                  <div className='flex items-center order-2'>
                    {aboutPage.contact?.instagram && (
                      <a
                        href={aboutPage.contact.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:opacity-70 transition-opacity'
                      >
                        <FiInstagram className='w-6 h-6' />
                      </a>
                    )}
                    {aboutPage.contact?.facebook && (
                      <a
                        href={aboutPage.contact.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:opacity-70 transition-opacity'
                      >
                        <BiLogoFacebookSquare className='w-7 h-7' />
                      </a>
                    )}
                  </div>

                  {aboutPage.contact?.email && (
                    <a
                      href={`mailto:${aboutPage.contact.email}`}
                      className='text-sm hover:opacity-70 transition-opacity block mr-4 lg:mr-0 order-1 lg:order-3'
                    >
                      {aboutPage.contact.email}
                    </a>
                  )}

                  {aboutPage.cv?.asset?.url && (
                    <div className='order-5'>
                      <a
                        href={aboutPage.cv.asset.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-block text-black border-b border-black text-sm'
                      >
                        Download CV
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
