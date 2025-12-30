'use client'

interface BrushFrameProps {
  color?: string
  className?: string
}

export default function BrushFrame({
  color = '#000000',
  className = '',
}: BrushFrameProps) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox='0 0 100 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      preserveAspectRatio='none'
    >
      {/* Top edge */}
      <path
        d='M 0,1 Q 5,0.8 10,1.2 T 20,0.9 T 30,1.3 T 40,0.8 T 50,1.1 T 60,0.9 T 70,1.2 T 80,0.8 T 90,1.1 T 100,1'
        stroke={color}
        strokeWidth='2.5'
        fill='none'
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />

      {/* Right edge */}
      <path
        d='M 99,0 Q 99.2,10 98.8,20 T 99.1,30 T 98.7,40 T 99.2,50 T 98.8,60 T 99.1,70 T 98.8,80 T 99.2,90 T 99,100'
        stroke={color}
        strokeWidth='2.5'
        fill='none'
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />

      {/* Bottom edge */}
      <path
        d='M 100,99 Q 95,99.2 90,98.8 T 80,99.1 T 70,98.7 T 60,99.2 T 50,98.9 T 40,99.1 T 30,98.8 T 20,99.2 T 10,98.9 T 0,99'
        stroke={color}
        strokeWidth='2.5'
        fill='none'
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />

      {/* Left edge */}
      <path
        d='M 1,100 Q 0.8,90 1.2,80 T 0.9,70 T 1.3,60 T 0.8,50 T 1.1,40 T 0.9,30 T 1.2,20 T 0.8,10 T 1,0'
        stroke={color}
        strokeWidth='2.5'
        fill='none'
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  )
}
