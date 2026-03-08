'use client'

import React, { useMemo } from 'react'

type StrokeSrc = string | string[]

interface BrushFrameRasterProps {
  className?: string

  /** Provide either a string or an array of variant strings per side */
  top: StrokeSrc
  right: StrokeSrc
  bottom: StrokeSrc
  left: StrokeSrc

  /**
   * How far the brush extends beyond the frame (in px).
   * Usually negative looks best because paint sits slightly outside the content edge.
   */
  bleedPx?: number

  /**
   * Brush thickness in px (how “fat” the stroke looks).
   * If your stroke PNG is thicker/thinner, adjust this.
   */
  thicknessPx?: number

  /**
   * Global opacity multiplier for the strokes.
   */
  opacity?: number

  /**
   * Optional blend mode. Often looks more “painted” on light backgrounds with multiply.
   * Use 'normal' if you want pure color fidelity.
   */
  blendMode?: React.CSSProperties['mixBlendMode']

  /**
   * Subtle randomness to avoid “perfectly aligned” digital look.
   * Set to 0 to disable.
   */
  jitterPx?: number
}

function pickOne(src: StrokeSrc) {
  if (Array.isArray(src)) return src[Math.floor(Math.random() * src.length)]
  return src
}

export default function BrushFrameRaster({
  className = '',
  top,
  right,
  bottom,
  left,
  bleedPx = 10,
  thicknessPx = 44,
  opacity = 1,
  blendMode = 'multiply',
  jitterPx = 2,
}: BrushFrameRasterProps) {
  // Pick variants once per mount (stable until rerender/mount changes)
  const chosen = useMemo(
    () => ({
      top: pickOne(top),
      right: pickOne(right),
      bottom: pickOne(bottom),
      left: pickOne(left),
    }),
    // Intentionally only depend on the inputs; variant selection happens once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [top, right, bottom, left]
  )

  const j = () => (jitterPx ? (Math.random() * 2 - 1) * jitterPx : 0)

  const common: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    opacity,
    mixBlendMode: blendMode,
    // Helps avoid seams from antialiasing when rotated/scaled
    transformOrigin: 'center',
    // Keep raster crisp-ish without shimmer
    imageRendering: 'auto',
  }

  return (
    <div className={`absolute inset-0 z-20 pointer-events-none ${className}`}>
      {/* TOP */}
      <img
        src={chosen.top}
        alt=''
        aria-hidden='true'
        style={{
          ...common,
          left: -bleedPx + j(),
          top: -bleedPx + j(),
          width: `calc(100% + ${bleedPx * 2}px)`,
          height: thicknessPx,
          objectFit: 'fill', // stretch along length only (height fixed)
          transform: `translateZ(0) rotate(${jitterPx ? j() * 0.15 : 0}deg)`,
        }}
      />

      {/* BOTTOM */}
      <img
        src={chosen.bottom}
        alt=''
        aria-hidden='true'
        style={{
          ...common,
          left: -bleedPx + j(),
          bottom: -bleedPx + j(),
          width: `calc(100% + ${bleedPx * 2}px)`,
          height: thicknessPx,
          objectFit: 'fill',
          transform: `translateZ(0) rotate(${jitterPx ? j() * 0.15 : 0}deg)`,
        }}
      />

      {/* LEFT (rotate a horizontal stroke) */}
      {/* LEFT */}
      <img
        src={chosen.left}
        alt=''
        aria-hidden='true'
        style={{
          ...common,
          left: -bleedPx + j(),
          top: -bleedPx + j(),
          width: thicknessPx,
          height: `calc(100% + ${bleedPx * 2}px)`,
          objectFit: 'fill',
        }}
      />

      {/* RIGHT */}
      <img
        src={chosen.right}
        alt=''
        aria-hidden='true'
        style={{
          ...common,
          right: -bleedPx + j(),
          top: -bleedPx + j(),
          width: thicknessPx,
          height: `calc(100% + ${bleedPx * 2}px)`,
          objectFit: 'fill',
        }}
      />
    </div>
  )
}
