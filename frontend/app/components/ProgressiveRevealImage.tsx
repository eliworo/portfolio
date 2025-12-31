'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

type Props = {
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
  className?: string

  // optional: a blur placeholder (Sanity lqip)
  blurDataURL?: string
  priority?: boolean

  // optional: render overlay only after image decode
  overlay?: (ready: boolean) => React.ReactNode
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
}: Props) {
  const [ready, setReady] = React.useState(false)

  return (
    <div className='relative'>
      <motion.div
        initial={{
          filter: 'blur(18px)',
          opacity: 0.9,
          transform: 'translateZ(0)',
        }}
        whileInView={{ filter: 'blur(0px)', opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
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
            // decode is complete; safe to show overlays
            setReady(true)
          }}
          draggable={false}
        />
      </motion.div>

      {overlay ? overlay(ready) : null}
    </div>
  )
}
