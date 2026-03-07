import RealBrush from '@/app/components/drawings/RealBrush'

export default function BrushStrongMark({
  children,
  seed,
  color = '#D9D9D9',
}: {
  children: React.ReactNode
  seed: string
  color?: string
}) {
  return (
    <strong className='font-normal'>
      <span className='relative inline-block align-baseline leading-[1.05]'>
        <RealBrush
          as='span'
          seed={seed}
          color={color}
          className='absolute -inset-x-2 -z-10 opacity-90'
          style={{
            height: '1.05em',
            top: '72%',
            transform: 'translateY(-50%)',
          }}
        />
        <span className='relative z-10'>{children}</span>
      </span>
    </strong>
  )
}
