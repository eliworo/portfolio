import Image from 'next/image'

type ThreeDotsLoaderProps = {
  className?: string
  dotClassName?: string
}

export default function ThreeDotsLoader({
  className = 'h-svh w-full',
  dotClassName = 'h-3 w-3 lg:h-5 lg:w-5',
}: ThreeDotsLoaderProps) {
  return (
    <div
      className={`${className} flex items-center justify-center gap-1 lg:gap-2`}
    >
      <div className={`${dotClassName} relative`}>
        <Image
          src='/images/optimized/cercleRempliLogo-80.webp'
          alt='Loading...'
          width={80}
          height={86}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0s' }}
          priority
        />
      </div>
      <div className={`${dotClassName} relative`}>
        <Image
          src='/images/optimized/cercleRempliLogo-80.webp'
          alt='Loading...'
          width={80}
          height={86}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0.2s' }}
          priority
        />
      </div>
      <div className={`${dotClassName} relative`}>
        <Image
          src='/images/optimized/cercleRempliLogo-80.webp'
          alt='Loading...'
          width={80}
          height={86}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0.4s' }}
          priority
        />
      </div>
    </div>
  )
}
