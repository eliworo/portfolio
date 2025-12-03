// components/HeroVideo.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Define the necessary types for your Sanity data here
// For simplicity, I'll use `any` but you should use proper types
interface HomepageData {
  heroType: 'video' | 'vimeo' | 'youtube' | 'image'
  heroVideoMobile?: { asset?: { url: string } }
  heroVideoDesktop?: { asset?: { url: string } }
  heroImage?: { asset?: { url: string } }
  vimeoUrl?: string
  youtubeUrl?: string
  videoSettings: {
    autoplay: boolean
    muted: boolean
    loop: boolean
    controls: boolean
  }
}

interface HeroVideoProps {
  homepage: HomepageData // Pass the fetched data as a prop
  videoSettings: HomepageData['videoSettings']
}

const MD_BREAKPOINT = 768 // Tailwind's 'md' breakpoint by default

export function HeroVideo({ homepage, videoSettings }: HeroVideoProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  const [videoReady, setVideoReady] = useState(false)

  // 1. Determine screen size on the client
  useEffect(() => {
    // This runs only on the client
    const checkIsMobile = () => {
      // Check if the window object is available (it is once mounted)
      setIsMobile(window.innerWidth < MD_BREAKPOINT)
    }

    checkIsMobile() // Initial check
    setHasMounted(true) // Indicate that client-side rendering has started

    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 2. Conditionally render the correct video based on state
  const isVideoType = homepage.heroType === 'video'
  const isMobileVideoAvailable = homepage.heroVideoMobile?.asset?.url
  const isDesktopVideoAvailable = homepage.heroVideoDesktop?.asset?.url

  // If the component hasn't mounted yet, render nothing or a placeholder
  if (!hasMounted && isVideoType) {
    // Optional: Render a fallback image to fill the space
    return (
      <div className='relative'>
        {homepage?.heroImage?.asset?.url && (
          <div className='flex justify-center h-full w-full'>
            <Image
              src={homepage.heroImage.asset.url}
              alt='Hero Placeholder'
              width={800}
              height={400}
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}
      </div>
    )
  }

  // UPLOADED VIDEO LOGIC
  // UPLOADED VIDEO LOGIC
  if (isVideoType) {
    // Determine which URL to use based on client-side state
    const videoUrl =
      isMobile && isMobileVideoAvailable
        ? homepage.heroVideoMobile?.asset?.url
        : isDesktopVideoAvailable
          ? homepage.heroVideoDesktop?.asset?.url // Fallback to desktop on mobile if mobile isn't available
          : null

    if (videoUrl) {
      return (
        <div className='relative h-full w-auto sm:mx-0'>
          <video
            className='h-full w-full transform rounded-none border-0 object-cover sm:rounded-md'
            autoPlay={videoSettings.autoplay}
            loop={videoSettings.loop}
            muted={videoSettings.muted}
            playsInline
            controls={videoSettings.controls}
            poster={homepage?.heroImage?.asset?.url || undefined}
          >
            <source src={videoUrl} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }
  }

  // YOUTUBE/VIMEO/IMAGE LOGIC (kept separate for clarity, but you can merge them)
  // ... Keep your existing Vimeo, YouTube, and Image fallback logic here
  // Note: These use `fixed inset-0` so the responsive video swap isn't as critical for them
  if (homepage?.heroType === 'vimeo' && homepage?.vimeoUrl) {
    // ... your existing Vimeo logic (use className='relative' instead of 'fixed' if it's not a background video)
    return (
      <div className='fixed inset-0 z-0 overflow-hidden w-full h-full'>
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
    )
  }

  {
    homepage?.heroType === 'youtube' && homepage?.youtubeUrl && (
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
    )
  }

  if (homepage?.heroType === 'image' && homepage?.heroImage?.asset?.url) {
    return (
      <div className='flex justify-center h-full w-full'>
        <Image
          src={homepage.heroImage.asset.url}
          alt='Hero'
          width={800}
          height={400}
          style={{ objectFit: 'cover' }}
        />
      </div>
    )
  }

  return null
}
