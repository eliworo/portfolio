import localFont from 'next/font/local'

// Regular styles
export const agrandirRegular = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-Regular.woff2',
  variable: '--font-agrandir-regular',
  display: 'swap',
  preload: true,
})

export const agrandirBold = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-Bold.woff2',
  variable: '--font-agrandir-bold',
  display: 'swap',
  preload: true,
})

export const agrandirItalic = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-Italic.woff2',
  variable: '--font-agrandir-italic',
  display: 'swap',
})

// Grand styles
export const agrandirGrandHeavy = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-GrandHeavy.woff2',
  variable: '--font-agrandir-grand-heavy',
  display: 'swap',
})

export const agrandirGrandItalic = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-GrandItalic.woff2',
  variable: '--font-agrandir-grand-italic',
  display: 'swap',
})

export const agrandirGrandLight = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-GrandLight.woff2',
  variable: '--font-agrandir-grand-light',
  display: 'swap',
})

export const agrandirGrandRegular = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-GrandRegular.woff2',
  variable: '--font-agrandir-grand-regular',
  display: 'swap',
})

// Narrow styles
export const agrandirNarrowBlack = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-NarrowBlack.woff2',
  variable: '--font-agrandir-narrow-black',
  display: 'swap',
})

export const agrandirNarrowRegular = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-NarrowRegular.woff2',
  variable: '--font-agrandir-narrow-regular',
  display: 'swap',
})

// Tight styles
export const agrandirTightBlack = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-TightBlack.woff2',
  variable: '--font-agrandir-tight-black',
  display: 'swap',
})

export const agrandirTightRegular = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-TightRegular.woff2',
  variable: '--font-agrandir-tight-regular',
  display: 'swap',
})

export const agrandirTightThin = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-TightThin.woff2',
  variable: '--font-agrandir-tight-thin',
  display: 'swap',
})

// Thin styles
export const agrandirThinItalic = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-ThinItalic.woff2',
  variable: '--font-agrandir-thin-italic',
  display: 'swap',
})

// Wide styles
export const agrandirWideBlackItalic = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-WideBlackItalic.woff2',
  variable: '--font-agrandir-wide-black-italic',
  display: 'swap',
})

export const agrandirWideLight = localFont({
  src: '../public/fonts/Agrandir/PPAgrandir-WideLight.woff2',
  variable: '--font-agrandir-wide-light',
  display: 'swap',
})

// Text variants
export const agrandirTextBold = localFont({
  src: '../public/fonts/Agrandir/PPAgrandirText-Bold.woff2',
  variable: '--font-agrandir-text-bold',
  display: 'swap',
})

// Collection for convenience
export const agrandir = {
  regular: agrandirRegular,
  bold: agrandirBold,
  italic: agrandirItalic,
  grandHeavy: agrandirGrandHeavy,
  grandItalic: agrandirGrandItalic,
  grandLight: agrandirGrandLight,
  grandRegular: agrandirGrandRegular,
  narrowBlack: agrandirNarrowBlack,
  narrowRegular: agrandirNarrowRegular,
  tightBlack: agrandirTightBlack,
  tightRegular: agrandirTightRegular,
  tightThin: agrandirTightThin,
  thinItalic: agrandirThinItalic,
  wideBlackItalic: agrandirWideBlackItalic,
  wideLight: agrandirWideLight,
  textBold: agrandirTextBold,
}

// Helper to combine all font variables into a single string
export function getFontVariables() {
  return [
    agrandirRegular.variable,
    agrandirBold.variable,
    agrandirItalic.variable,
    agrandirGrandHeavy.variable,
    agrandirGrandItalic.variable,
    agrandirGrandLight.variable,
    agrandirGrandRegular.variable,
    agrandirNarrowBlack.variable,
    agrandirNarrowRegular.variable,
    agrandirTightBlack.variable,
    agrandirTightRegular.variable,
    agrandirTightThin.variable,
    agrandirThinItalic.variable,
    agrandirWideBlackItalic.variable,
    agrandirWideLight.variable,
    agrandirTextBold.variable,
  ].join(' ')
}
