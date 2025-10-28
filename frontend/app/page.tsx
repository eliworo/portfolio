import { Suspense } from 'react'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'

import { AllPosts } from '@/app/components/Posts'
import GetStartedCode from '@/app/components/GetStartedCode'
import SideBySideIcons from '@/app/components/SideBySideIcons'
import { homepageQuery } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Image from 'next/image'

export default async function Page() {
  const { data: homepage } = await sanityFetch({
    query: homepageQuery,
  })

  return (
    <>
      <div className='relative'>
        {/* Uploaded video */}
        {homepage?.heroType === 'video' && homepage?.heroVideo?.asset?.url && (
          <div className='h-full w-auto sm:mx-0'>
            <video
              className='h-full w-full transform rounded-none border-0 object-cover sm:rounded-md'
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={homepage.heroVideo.asset.url} type='video/mp4' />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Vimeo */}
        {homepage?.heroType === 'vimeo' && homepage?.vimeoUrl && (
          <div
            className='
      fixed inset-0 z-0 pointer-events-none overflow-hidden
      w-full h-full
    '
          >
            <iframe
              src={`${homepage.vimeoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}?autoplay=1&muted=1&loop=1&background=1&byline=0&title=0`}
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
              loading='lazy'
              className='
        absolute top-1/2 left-1/2
        min-w-[177.77vh] min-h-[100vh]
        w-[100vw] h-[56.25vw]
        -translate-x-1/2 -translate-y-1/2
        object-cover border-0
      '
              style={{ pointerEvents: 'none' }}
            />
          </div>
        )}

        {/* Image fallback */}
        {homepage?.heroType === 'image' && homepage?.heroImage?.asset?.url && (
          <div className='flex justify-center'>
            <Image
              src={homepage.heroImage.asset.url}
              alt='Hero'
              width={800}
              height={400}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {homepage?.heroImage && (
          <div className='flex justify-center'>
            <Image
              src={homepage.heroImage.asset.url}
              alt='Hero'
              width={800}
              height={400}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
      {/* <div className='border-t border-gray-100 bg-gray-50'>
        <div className='container'>
          <aside className='py-12 sm:py-20'>
            <Suspense>{await AllPosts()}</Suspense>
          </aside>
        </div>
      </div> */}
    </>
  )
}
