import Image from 'next/image'

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className='h-svh w-full flex justify-center items-center gap-1 lg:gap-2'>
      <div className='h-5 w-5 lg:h-5 lg:w-5 relative'>
        <Image
          src='/images/cercleRempliLogo.png'
          alt='Loading...'
          width={50}
          height={50}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0s' }}
          priority
        />
      </div>
      <div className='h-5 w-5 lg:h-5 lg:w-5 relative'>
        <Image
          src='/images/cercleRempliLogo.png'
          alt='Loading...'
          width={50}
          height={50}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0.2s' }}
          priority
        />
      </div>
      <div className='h-5 w-5 lg:h-5 lg:w-5 relative'>
        <Image
          src='/images/cercleRempliLogo.png'
          alt='Loading...'
          width={50}
          height={50}
          className='animate-bounce h-full w-full'
          style={{ animationDelay: '0.4s' }}
          priority
        />
      </div>
    </div>
  )
}
