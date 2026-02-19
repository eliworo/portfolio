import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)
const DEFAULT_QUALITY = 72

export function urlFor(source: any) {
  return builder.image(source).auto('format').fit('max').quality(DEFAULT_QUALITY)
}
