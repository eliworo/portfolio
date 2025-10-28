// Create a new file: components/HandwrittenLine.tsx
import React from 'react'

type LineProps = {
  direction: 'horizontal' | 'vertical' | 'branch'
  className?: string
}

export default function HandwrittenLine({
  direction,
  className = '',
}: LineProps) {
  // Different SVG paths based on direction
  const getPath = () => {
    switch (direction) {
      case 'horizontal':
        return 'M1,10 C5,9 10,11 20,10 C30,9 35,11 40,10' // Wavy horizontal line
      case 'vertical':
        return 'M10,1 C11,10 9,20 10,30 C11,40 9,45 10,50' // Wavy vertical line
      case 'branch':
        return 'M1,10 C5,9 10,11 20,10 L20,10 C20,15 19,25 20,35' // L-shaped branch
      default:
        return 'M1,10 C5,9 10,11 20,10' // Default horizontal
    }
  }

  // Size based on direction
  const getViewBox = () => {
    switch (direction) {
      case 'horizontal':
        return '0 0 42 20'
      case 'vertical':
        return '0 0 20 52'
      case 'branch':
        return '0 0 25 40'
      default:
        return '0 0 42 20'
    }
  }

  return (
    <svg
      viewBox={getViewBox()}
      xmlns='http://www.w3.org/2000/svg'
      className={`stroke-black ${className}`}
      style={{ overflow: 'visible' }}
    >
      <path
        d={getPath()}
        fill='none'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeDasharray={direction === 'branch' ? '0' : '0'}
        style={{ vectorEffect: 'non-scaling-stroke' }}
      />
    </svg>
  )
}
