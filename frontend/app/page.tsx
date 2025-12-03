import { homepageQuery } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Image from 'next/image'
import { PostItNote } from './components/PostItNote'
import Loading from './loading'

export default async function Page() {
  const { data: homepage } = await sanityFetch({
    query: homepageQuery,
  })

  // Get video settings with defaults
  const videoSettings = homepage?.videoSettings || {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
  }

  return (
    <>
      <div className='relative'>
        {/* <div className='absolute bottom-20 right-10 z-50'>
          <PostItNote />
        </div> */}

        {/* Uploaded video */}
        {homepage?.heroType === 'video' && (
          <>
            {/* Mobile video */}
            {homepage?.heroVideoMobile?.asset?.url && (
              <div className='block md:hidden h-svh w-auto sm:mx-0'>
                <video
                  className='h-full w-full transform rounded-none border-0 object-cover'
                  autoPlay={videoSettings.autoplay}
                  loop={videoSettings.loop}
                  muted={videoSettings.muted}
                  playsInline
                  controls={videoSettings.controls}
                  poster={homepage?.heroImage?.asset?.url || undefined}
                >
                  <source
                    src={homepage.heroVideoMobile.asset.url}
                    type='video/mp4'
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Desktop video */}
            {homepage?.heroVideoDesktop?.asset?.url && (
              <div className='hidden md:block h-svh w-auto sm:mx-0'>
                <video
                  className='h-full w-full transform rounded-none border-0 object-cover'
                  autoPlay={videoSettings.autoplay}
                  loop={videoSettings.loop}
                  muted={videoSettings.muted}
                  playsInline
                  controls={videoSettings.controls}
                  poster={homepage?.heroImage?.asset?.url || undefined}
                >
                  <source
                    src={homepage.heroVideoDesktop.asset.url}
                    type='video/mp4'
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </>
        )}

        {/* Vimeo with poster image */}
        {homepage?.heroType === 'vimeo' && homepage?.vimeoUrl && (
          <div className='fixed inset-0 z-0 overflow-hidden w-full h-full'>
            {/* Poster Image - shows immediately */}
            {homepage?.heroImage?.asset?.url && (
              <div className='absolute inset-0 z-10'>
                <Image
                  src={homepage.heroImage.asset.url}
                  alt='Video poster'
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            )}
            {/* Vimeo iframe - loads on top */}
            <iframe
              src={`${homepage.vimeoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}?autoplay=${videoSettings.autoplay ? 1 : 0}&muted=${videoSettings.muted ? 1 : 0}&loop=${videoSettings.loop ? 1 : 0}&background=${videoSettings.controls ? 0 : 1}&byline=0&title=0&controls=${videoSettings.controls ? 1 : 0}`}
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
              loading='lazy'
              className='absolute top-1/2 left-1/2 min-w-[177.77vh] min-h-[100vh] w-[100vw] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover border-0 z-20'
              style={{
                pointerEvents: videoSettings.controls ? 'auto' : 'none',
              }}
            />
          </div>
        )}

        {/* YouTube with poster image */}
        {homepage?.heroType === 'youtube' && homepage?.youtubeUrl && (
          <div className='fixed inset-0 z-0 overflow-hidden w-full h-full'>
            {/* Poster Image - shows immediately */}
            {homepage?.heroImage?.asset?.url && (
              <div className='absolute inset-0 z-10'>
                <Image
                  src={homepage.heroImage.asset.url}
                  alt='Video poster'
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            )}
            {/* YouTube iframe - loads on top */}
            <iframe
              src={`https://www.youtube.com/embed/${homepage.youtubeUrl.split('v=')[1]?.split('&')[0]}?autoplay=${videoSettings.autoplay ? 1 : 0}&mute=${videoSettings.muted ? 1 : 0}&loop=${videoSettings.loop ? 1 : 0}&controls=${videoSettings.controls ? 1 : 0}&playlist=${homepage.youtubeUrl.split('v=')[1]?.split('&')[0]}`}
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
              loading='lazy'
              className='absolute top-1/2 left-1/2 min-w-[177.77vh] min-h-[100vh] w-[100vw] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 object-cover border-0 z-20'
              style={{
                pointerEvents: videoSettings.controls ? 'auto' : 'none',
              }}
            />
          </div>
        )}

        {/* Image fallback */}
        {homepage?.heroType === 'image' && homepage?.heroImage?.asset?.url && (
          <div className='flex justify-center h-full w-full'>
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
    </>
  )
}
