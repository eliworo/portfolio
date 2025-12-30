// ./drawings/RealBrush.tsx
'use client'

import { useMemo } from 'react'

interface BrushProps {
  seed: string
  color?: string
  className?: string
  style?: React.CSSProperties
}

const brushTextures = [
  '/images/brush/brush-1.png',
  // '/images/brush/brush-2.png',
  // '/images/brush/brush-3.png',
  // '/images/brush/brush-4.png',
]

function hashStringToU32(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export default function RealBrush({
  seed,
  color = '#9AB1FF',
  className,
  style,
}: BrushProps) {
  const src = useMemo(() => {
    return brushTextures[hashStringToU32(seed) % brushTextures.length]
  }, [seed])

  const maskStyles: React.CSSProperties = {
    backgroundColor: color,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    pointerEvents: 'none',
  }

  return (
    <div
      aria-hidden
      className={className}
      style={{ ...maskStyles, ...style }}
    />
  )
}
