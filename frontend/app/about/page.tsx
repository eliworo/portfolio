import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutPageQuery } from '@/sanity/lib/queries'

export default async function AboutPage() {
  const { data: aboutPage } = await sanityFetch({
    query: aboutPageQuery,
  })

  if (!aboutPage) {
    return null
  }

  return (
    <main className='w-full pl-60 pr-8'>
      {aboutPage.logo?.asset?.url && (
        <div className='mb-8 fixed left-12 top-12 -rotate-4'>
          <Image
            src={aboutPage.logo.asset.url}
            alt='About Logo'
            width={600}
            height={200}
            style={{
              objectFit: 'contain',
              width: 'auto',
              maxHeight: '200px',
            }}
          />
        </div>
      )}

      <div className='flex w-full'>
        <div className='w-full'></div>
        {/* Content */}
        <div className='text-black/85 text-2xl leading-tight font-agrandir-tight mb-12 w-full columns-1 py-32'>
          {/* Bio */}
          {aboutPage.bio && (
            <div className='mb-12'>
              <p>{aboutPage.bio}</p>
            </div>
          )}

          {/* Content Blocks */}
          {aboutPage.content && (
            <div className='mb-12'>
              <PortableText value={aboutPage.content} />
            </div>
          )}

          {/* Profile Image */}
          {aboutPage.profileImage?.asset?.url && (
            <div className='fixed left-[20%] top-[28%] mb-12 -z-1'>
              <Image
                src={aboutPage.profileImage.asset.url}
                alt={aboutPage.profileImage.alt || 'Profile Image'}
                width={2000}
                height={2000}
                className='w-full max-w-md h-auto object-cover'
              />
            </div>
          )}

          {/* Contact Information */}
          {aboutPage.contact && (
            <div className='mb-12'>
              <h3 className='text-xl font-semibold mb-4'>Contact</h3>
              {aboutPage.contact.email && (
                <p className='mb-2'>
                  <a
                    href={`mailto:${aboutPage.contact.email}`}
                    className='hover:underline'
                  >
                    {aboutPage.contact.email}
                  </a>
                </p>
              )}
              {aboutPage.contact.instagram && (
                <p className='mb-2'>
                  <a
                    href={aboutPage.contact.instagram}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    Instagram
                  </a>
                </p>
              )}
              {aboutPage.contact.linkedin && (
                <p className='mb-2'>
                  <a
                    href={aboutPage.contact.linkedin}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    LinkedIn
                  </a>
                </p>
              )}
            </div>
          )}

          {/* CV Download */}
          {aboutPage.cv?.asset?.url && (
            <div className='mb-12'>
              <a
                href={aboutPage.cv.asset.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors'
              >
                Download CV
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
