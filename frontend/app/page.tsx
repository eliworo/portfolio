import { aboutPageQuery, homepageQuery } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Image from 'next/image'
import { PostItNote } from './components/PostItNote'
import Loading from './loading'
import HeroVideo from './components/HeroVideo'
import NewsPostIts from './components/NewsPostIts'
import ContactNav from './components/ContactNav'

export default async function Page() {
  const [{ data: homepage }, { data: aboutPage }] = await Promise.all([
    sanityFetch({ query: homepageQuery }),
    sanityFetch({ query: aboutPageQuery }),
  ])

  // Get video settings with defaults
  const videoSettings = homepage?.videoSettings || {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
  }

  return (
    <>
      <div className='relative h-screen overflow-hidden'>
        {homepage?.newsPostIts && <NewsPostIts news={homepage.newsPostIts} />}

        {homepage?.heroType === 'video' && (
          <>
            {/* Mobile video */}
            {homepage?.heroVideoMobile?.asset?.url && (
              <div className='block md:hidden'>
                <HeroVideo
                  videoUrl={homepage.heroVideoMobile.asset.url}
                  posterUrl={homepage?.heroImage?.asset?.url}
                  muteIconUrl={homepage?.muteIcon?.asset?.url}
                  unmuteIconUrl={homepage?.unmuteIcon?.asset?.url}
                  autoplay={videoSettings.autoplay}
                  loop={videoSettings.loop}
                />
              </div>
            )}

            {/* Desktop video */}
            {homepage?.heroVideoDesktop?.asset?.url && (
              <div className='hidden md:block'>
                <HeroVideo
                  videoUrl={homepage.heroVideoDesktop.asset.url}
                  posterUrl={homepage?.heroImage?.asset?.url}
                  muteIconUrl={homepage?.muteIcon?.asset?.url}
                  unmuteIconUrl={homepage?.unmuteIcon?.asset?.url}
                  autoplay={videoSettings.autoplay}
                  loop={videoSettings.loop}
                />
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

      <ContactNav
        contact={aboutPage?.contact ?? null}
        cv={aboutPage?.cv}
        contactImageUrl={aboutPage?.contactImage?.asset?.url}
      />
    </>
  )
}
