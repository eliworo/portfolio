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
  blurDataURL?: string
  priority?: boolean
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
      {/* Clip blur bleed to the image bounds */}
      <div className='relative overflow-hidden'>
        <motion.div
          initial={{
            filter: 'blur(18px)',
            opacity: 0.85,
            transform: 'translateZ(0) scale(1.02)',
          }}
          whileInView={{
            filter: 'blur(0px)',
            opacity: 1,
            transform: 'translateZ(0) scale(1)',
          }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
            onLoadingComplete={() => setReady(true)}
            draggable={false}
          />
        </motion.div>
      </div>

      {overlay ? overlay(ready) : null}
    </div>
  )
}
