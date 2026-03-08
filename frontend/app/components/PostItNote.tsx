// components/PostItNote.tsx
'use client'

/**
 * Renders a Post-It Note style element using pure Tailwind CSS.
 * This is achieved by nesting two elements to simulate the ::before and ::after pseudo-elements
 * used for the complex tilted shadows.
 */
export function PostItNote() {
  return (
    <div className='relative'>
      <div
        // Base Post-It container
        className='
        h-32 w-56 
        relative  
        bg-white/93
        border-r border-b border-white 
        shadow-[1px_6px_3px_rgba(0,0,0,0.1),2px_33px_23px_rgba(0,0,0,0.07)_inset] 
        p-2
        text-gray-800 text-sm
        blur-[1px]
      '
      >
        {/* This div simulates the ::before pseudo-element for the left shadow 
        The shadow is manually positioned, sized, and rotated.
      */}
      </div>
      {/* Post-It Content */}
      <div className='absolute left-0 top-0 p-2 leading-snug'>
        <h3 className='text-base xl:text-lg font-bold mb-1'>Hi!</h3>
        <p className='text-sm xl:text-lg mb-1 leading-snug tracking-tight'>
          Remember to optimize the video loading later. The current setup might
          still cause a flash on mobile devices.
        </p>
      </div>
    </div>
  )
}
