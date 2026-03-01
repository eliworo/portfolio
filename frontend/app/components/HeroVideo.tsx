'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

type HeroVideoProps = {
  videoUrl: string
  posterUrl?: string
  muteIconUrl?: string // Made optional to prevent TS errors
  unmuteIconUrl?: string // Made optional
  autoplay?: boolean
  loop?: boolean
  className?: string
}

export default function HeroVideo({
  videoUrl,
  posterUrl,
  muteIconUrl,
  unmuteIconUrl,
  autoplay = true,
  loop = true,
  className = '',
}: HeroVideoProps) {
  // Initialize muted based on autoplay (browsers require mute for autoplay)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Attempt autoplay logic
    if (videoRef.current && autoplay) {
      videoRef.current.play().catch(() => {
        // If autoplay fails, force mute and try again
        setIsMuted(true)
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current
            .play()
            .catch((e) => console.log('Autoplay failed', e))
        }
      })
    }
  }, [autoplay])

  const toggleMute = () => {
    if (videoRef.current) {
      // Toggle the video element
      videoRef.current.muted = !isMuted
      // Update state
      setIsMuted(!isMuted)
    }
  }

  // LOGIC FIX: Determine the active icon URL safely
  // 1. If muted, use muteIconUrl
  // 2. If unmuted, use unmuteIconUrl. If that doesn't exist, fallback to muteIconUrl.
  const activeIconSrc = isMuted ? muteIconUrl : unmuteIconUrl || muteIconUrl

  return (
    <div className='relative h-screen w-full'>
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${className}`}
        autoPlay={autoplay}
        loop={loop}
        muted={isMuted}
        playsInline
        poster={posterUrl}
      >
        <source src={videoUrl} type='video/mp4' />
        Your browser does not support the video tag.
      </video>

      {/* Only render the button if we actually have an icon to show */}
      {activeIconSrc && (
        <button
          onClick={toggleMute}
          className='absolute bottom-1 left-1 lg:bottom-6 lg:left-6 z-[90] pointer-events-auto p-2 transition-transform hover:scale-105 duration-150 ease-in-out cursor-pointer'
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {/* We ensure activeIconSrc is a string before passing to Image */}
          <Image
            src={activeIconSrc}
            alt={isMuted ? 'Unmute' : 'Mute'}
            width={200}
            height={200}
            className='w-9 h-9 lg:w-12 lg:h-12 object-contain drop-shadow-md'
          />
        </button>
      )}
    </div>
  )
}
