import React from 'react'
import RealBrush from '../drawings/RealBrush'

export function BrushMark({
  children,
  seed,
  color = '#D9D9D9',
  insetXClass = '-inset-x-2',
  opacityClass = 'opacity-90',
  height = '1.05em',
  top = '72%',
  className = '',
}: {
  children: React.ReactNode
  seed: string
  color?: string
  insetXClass?: string
  opacityClass?: string
  height?: string
  top?: string
  className?: string
}) {
  return (
    <span
      className={`relative inline-block align-baseline leading-[1.05] ${className}`}
    >
      <RealBrush
        as='span'
        seed={seed}
        color={color}
        className={`absolute ${insetXClass} -z-10 ${opacityClass} pointer-events-none`}
        style={{
          height,
          top,
          transform: 'translateY(-75%)',
        }}
      />
      <span className='relative z-10'>{children}</span>
    </span>
  )
}
