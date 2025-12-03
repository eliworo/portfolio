import './globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { VisualEditing, toPlainText } from 'next-sanity'
import { Toaster } from 'sonner'

import DraftModeToast from '@/app/components/DraftModeToast'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'
import * as demo from '@/sanity/lib/demo'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { navigationImagesQuery, settingsQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { handleError } from './client-utils'
import Navigation from './components/Navigation'
import NavigationWrapper from './components/NavigationWrapper'

import { agrandirRegular, getFontVariables } from './fonts'
import MobileNavigation from './components/MobileNavigation'

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title || demo.title
  const description = settings?.description || demo.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = settings?.ogImage?.metadataBase
      ? new URL(settings.ogImage.metadataBase)
      : undefined
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: navImages } = await sanityFetch({
    query: navigationImagesQuery,
  })
  const { isEnabled: isDraftMode } = await draftMode()

  const fontVariables = getFontVariables()

  return (
    <html lang='en' className={`${fontVariables}`}>
      <body className='font-agrandir'>
        <section className='min-h-screen'>
          {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
          <Toaster />
          {isDraftMode && (
            <>
              <DraftModeToast />
              {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
              <VisualEditing />
            </>
          )}
          {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
          <SanityLive onError={handleError} />
          <div className='hidden lg:block'>
            <Navigation navImages={navImages} />
          </div>

          <div className='block lg:hidden'>
            <MobileNavigation navImages={navImages} />
          </div>

          {/* <Header /> */}
          {children}
          {/* <Footer /> */}
        </section>
        <SpeedInsights />
      </body>
    </html>
  )
}
