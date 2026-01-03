import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='h-svh w-full flex items-center justify-center'>
      <div className='px-16'>
        <Image
          src={'/images/404.png'}
          alt='404'
          width={600}
          height={600}
          className='object-contain select-none pointer-events-none'
        />
        <h2 className='text-center mt-8'>
          Oops! This page doesn&apos;t exist. <br />
          <Link className='underline underline-offset-4' href='/'>
            Go back home
          </Link>
          .
        </h2>
      </div>
    </div>
  )
}
