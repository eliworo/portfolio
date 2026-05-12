import type { CSSProperties } from 'react'

export type BlendRect = {
  x: number
  y: number
  width: number
  height: number
}

type Bounds = {
  width: number
  height: number
}

type BlendArrowProps = {
  direction: 'left' | 'right' | 'up'
  className?: string
  bounds?: Bounds
  blendRects?: BlendRect[]
}

const ARROW_RIGHT_SRC = '/images/optimized/arrowRightLogo-180.webp'
const ARROW_LEFT_SRC = '/images/optimized/arrowLeftLogo-180.webp'

function getMaskStyle(direction: BlendArrowProps['direction']): CSSProperties {
  const src = direction === 'left' ? ARROW_LEFT_SRC : ARROW_RIGHT_SRC

  return {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    transform: direction === 'up' ? 'rotate(-90deg)' : undefined,
  }
}

function intersectRect(a: BlendRect, b: BlendRect): BlendRect | null {
  const x = Math.max(a.x, b.x)
  const y = Math.max(a.y, b.y)
  const right = Math.min(a.x + a.width, b.x + b.width)
  const bottom = Math.min(a.y + a.height, b.y + b.height)
  const width = right - x
  const height = bottom - y

  if (width <= 0 || height <= 0) return null
  return { x, y, width, height }
}

function subtractRect(base: BlendRect, cut: BlendRect) {
  const overlap = intersectRect(base, cut)
  if (!overlap) return [base]

  const baseRight = base.x + base.width
  const baseBottom = base.y + base.height
  const overlapRight = overlap.x + overlap.width
  const overlapBottom = overlap.y + overlap.height

  return [
    {
      x: base.x,
      y: base.y,
      width: base.width,
      height: overlap.y - base.y,
    },
    {
      x: base.x,
      y: overlapBottom,
      width: base.width,
      height: baseBottom - overlapBottom,
    },
    {
      x: base.x,
      y: overlap.y,
      width: overlap.x - base.x,
      height: overlap.height,
    },
    {
      x: overlapRight,
      y: overlap.y,
      width: baseRight - overlapRight,
      height: overlap.height,
    },
  ].filter((rect) => rect.width > 0.5 && rect.height > 0.5)
}

function subtractRects(base: BlendRect, cuts: BlendRect[]) {
  return cuts.reduce<BlendRect[]>((segments, cut) => {
    return segments.flatMap((segment) => subtractRect(segment, cut))
  }, [base])
}

function clippedLayerStyle(
  rect: BlendRect,
  bounds: Bounds,
  direction: BlendArrowProps['direction'],
): CSSProperties {
  return {
    ...getMaskStyle(direction),
    width: bounds.width,
    height: bounds.height,
    left: -rect.x,
    top: -rect.y,
  }
}

function ClipLayer({
  rect,
  bounds,
  direction,
  className,
}: {
  rect: BlendRect
  bounds: Bounds
  direction: BlendArrowProps['direction']
  className: string
}) {
  return (
    <span
      className='absolute overflow-hidden'
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    >
      <span
        className={`absolute ${className}`}
        style={clippedLayerStyle(rect, bounds, direction)}
      />
    </span>
  )
}

export default function BlendArrow({
  direction,
  className = '',
  bounds,
  blendRects = [],
}: BlendArrowProps) {
  const hasBounds = bounds && bounds.width > 0 && bounds.height > 0
  const baseRect = hasBounds
    ? { x: 0, y: 0, width: bounds.width, height: bounds.height }
    : null
  const clippedBlendRects =
    baseRect && blendRects.length > 0
      ? blendRects
          .map((rect) => intersectRect(baseRect, rect))
          .filter((rect): rect is BlendRect => Boolean(rect))
      : []
  const blackRects =
    baseRect && clippedBlendRects.length > 0
      ? subtractRects(baseRect, clippedBlendRects)
      : []
  const visibleBlackRects = baseRect
    ? blackRects.length > 0
      ? blackRects
      : [baseRect]
    : []

  return (
    <span
      aria-hidden='true'
      className={`relative z-10 block select-none pointer-events-none ${className}`}
    >
      {hasBounds ? (
        <>
          {visibleBlackRects.map((rect, index) => (
            <ClipLayer
              key={`black-${index}`}
              rect={rect}
              bounds={bounds}
              direction={direction}
              className='bg-black'
            />
          ))}
          {clippedBlendRects.map((rect, index) => (
            <ClipLayer
              key={`blend-${index}`}
              rect={rect}
              bounds={bounds}
              direction={direction}
              className='bg-white mix-blend-difference'
            />
          ))}
        </>
      ) : (
        <span
          className='absolute inset-0 bg-black'
          style={getMaskStyle(direction)}
        />
      )}
    </span>
  )
}
