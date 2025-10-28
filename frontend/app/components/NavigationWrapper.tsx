import { sanityFetch } from '@/sanity/lib/live'
import { navigationImagesQuery } from '@/sanity/lib/queries'
import Navigation from './Navigation'

export default async function NavigationWrapper() {
  const { data: navImages } = await sanityFetch({
    query: navigationImagesQuery,
  })

  return <Navigation navImages={navImages} />
}
