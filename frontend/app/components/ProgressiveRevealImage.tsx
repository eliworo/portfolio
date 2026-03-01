'use client'

import React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useInView } from 'motion/react'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
  className?: string
  blurDataURL?: string
  priority?: boolean
  overlay?: (ready: boolean) => React.ReactNode
  revealEffect?: 'blur' | 'pixelate' | 'pixelate-blur'
  onReady?: () => void
}

type RevealEffect = NonNullable<Props['revealEffect']>

type EffectConfig = {
  initial: Record<string, any>
  animate: Record<string, any>
  transition: any
  imageRendering: 'auto' | 'pixelated'
  animateImageRendering?: boolean
  imageRenderingResetDelayMs?: number
}

export function ProgressiveRevealImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  blurDataURL,
  priority,
  overlay,
  revealEffect = 'pixelate-blur',
  onReady,
}: Props) {
  const [ready, setReady] = React.useState(false)
  const shouldReduceMotion = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const effects: Record<RevealEffect, EffectConfig> = {
    blur: {
      initial: {
        filter: 'blur(18px)',
        opacity: 0.85,
        transform: 'translateZ(0) scale(1.02)',
      },
      animate: {
        filter: 'blur(0px)',
        opacity: 1,
        transform: 'translateZ(0) scale(1)',
      },
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      imageRendering: 'auto',
      animateImageRendering: false,
      imageRenderingResetDelayMs: 0,
    },

    pixelate: {
      initial: {
        opacity: 0.7,
        transform: 'translateZ(0) scale(1.05)',
      },
      animate: {
        opacity: 1,
        transform: 'translateZ(0) scale(1)',
      },
      transition: {
        opacity: { duration: 0.4, ease: 'easeOut' },
        transform: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
      },
      imageRendering: 'pixelated',
      animateImageRendering: true,
      imageRenderingResetDelayMs: 600,
    },

    'pixelate-blur': {
      initial: {
        filter: 'blur(12px)',
        opacity: 0.75,
        transform: 'translateZ(0) scale(1.08)',
      },
      animate: {
        filter: 'blur(0px)',
        opacity: 1,
        transform: 'translateZ(0) scale(1)',
      },
      transition: {
        filter: { duration: 0.5, ease: 'easeOut' },
        opacity: { duration: 0.4, ease: 'easeOut' },
        transform: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      },
      imageRendering: 'pixelated',
      animateImageRendering: true,
      imageRenderingResetDelayMs: 600,
    },
  }

  const effect = effects[revealEffect]

  const [imageRendering, setImageRendering] = React.useState<
    'auto' | 'pixelated'
  >(effect.imageRendering)

  React.useEffect(() => {
    setImageRendering(effect.imageRendering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealEffect])

  React.useEffect(() => {
    if (!effect.animateImageRendering) return
    if (!ready) return

    setImageRendering('pixelated')

    const delay = effect.imageRenderingResetDelayMs ?? 600
    const timer = window.setTimeout(() => {
      setImageRendering('auto')
    }, delay)

    return () => window.clearTimeout(timer)
  }, [ready, effect.animateImageRendering, effect.imageRenderingResetDelayMs])

  if (shouldReduceMotion) {
    return (
      <div className='relative'>
        <div className='relative overflow-hidden'>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={className}
            priority={priority}
            placeholder={blurDataURL ? 'blur' : undefined}
            blurDataURL={blurDataURL}
            onLoad={() => {
              setReady(true)
              onReady?.()
            }}
            draggable={false}
            style={{ imageRendering: 'auto' }}
          />
        </div>
        {overlay ? overlay(ready) : null}
      </div>
    )
  }

  return (
    <div className='relative' ref={ref}>
      <div className='relative overflow-hidden'>
        <motion.div
          initial={effect.initial}
          animate={isInView ? effect.animate : effect.initial}
          transition={effect.transition}
          style={{ willChange: 'transform, filter, opacity' }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={className}
            priority={priority}
            placeholder={blurDataURL ? 'blur' : undefined}
            blurDataURL={blurDataURL}
            onLoad={() => {
              setReady(true)
              onReady?.()
            }}
            onError={() => onReady?.()}
            draggable={false}
            style={{
              imageRendering,
              transition: effect.animateImageRendering
                ? 'image-rendering 0.3s ease-out'
                : undefined,
            }}
          />
        </motion.div>
      </div>

      {overlay ? overlay(ready) : null}
    </div>
  )
}
