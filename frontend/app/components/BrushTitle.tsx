'use client'

import React from 'react'
import RealBrush from './drawings/RealBrush'

/** deterministic tiny variation, avoids hydration mismatch */
function hashToFloat01(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

type BrushTitleProps = {
  children: React.ReactNode
  seed: string
  color?: string
  className?: string
  brushClassName?: string
  brushStyle?: React.CSSProperties
  as?: 'h2' | 'h3' | 'div' | 'span'
  rotate?: boolean
  maxRotateDeg?: number
}

export default function BrushTitle({
  children,
  seed,
  color = '#D9D9D9',
  className = '',
  brushClassName = 'absolute -inset-x-3 -inset-y-2 -z-10 opacity-90',
  brushStyle,
  as: Tag = 'h3',
  rotate = true,
  maxRotateDeg = 3,
}: BrushTitleProps) {
  const r = hashToFloat01(seed)

  const rotateDeg = rotate
    ? (r * maxRotateDeg * 2 - maxRotateDeg).toFixed(2)
    : '0'

  const y = rotate
    ? ((r * maxRotateDeg * 2 - maxRotateDeg) * 0.6).toFixed(2)
    : '0'

  return (
    <Tag className={className}>
      <span
        className='relative inline-block leading-none'
        style={{
          transform: `translateY(${y}px) rotate(${rotateDeg}deg)`,
        }}
      >
        <RealBrush
          seed={`brush-title:${seed}`}
          color={color}
          className={brushClassName}
          style={{
            height: '1.35em',
            top: '70%',
            transform: 'translateY(-52%)',
            ...brushStyle,
          }}
        />
        <span className='relative z-10'>{children}</span>
      </span>
    </Tag>
  )
}
