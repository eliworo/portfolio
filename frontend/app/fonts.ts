import localFont from 'next/font/local'

export const ppRadioGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-Ultralight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-UltralightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/PP-Radio-Grotesk/PPRadioGrotesk-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-pp-radio-grotesk',
  display: 'swap',
  preload: true,
})

export function getFontVariables() {
  return [ppRadioGrotesk.variable].join(' ')
}
