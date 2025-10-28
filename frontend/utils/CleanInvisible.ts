// utils/cleanInvisible.ts
export const INVISIBLE_RE = /[\u200B-\u200F\u2028\u2029\uFEFF\u2060]/g

export function stripInvisible(s?: string | null) {
  if (!s) return s
  return s.replace(INVISIBLE_RE, '').trim()
}

/** Clean Portable Text blocks (basic: cleans text in spans) */
export function cleanPortableText(blocks: any[] = []) {
  return blocks.map((block) => {
    if (block?._type === 'block' && Array.isArray(block.children)) {
      return {
        ...block,
        children: block.children.map((child: any) => ({
          ...child,
          text:
            typeof child.text === 'string'
              ? stripInvisible(child.text)
              : child.text,
        })),
      }
    }
    // keep other block types but clean common string props (image alts/captions)
    if (block?._type === 'image') {
      return {
        ...block,
        alt: stripInvisible(block.alt),
        caption: stripInvisible(block.caption),
      }
    }
    return block
  })
}

/** Clean an entire content block */
export function cleanBlock<T extends any>(b: T): T {
  if (!b || typeof b !== 'object') return b
  const copy: any = JSON.parse(JSON.stringify(b)) // shallow safe deep-clone
  // common string fields to clean
  if (copy.imagePosition)
    copy.imagePosition = stripInvisible(copy.imagePosition)
  if (copy.imageSize) copy.imageSize = stripInvisible(copy.imageSize)
  if (copy.columns) copy.columns = stripInvisible(copy.columns)
  if (copy.alignment) copy.alignment = stripInvisible(copy.alignment)
  if (copy.spacing) copy.spacing = stripInvisible(copy.spacing)
  if (copy.text) copy.text = cleanPortableText(copy.text)
  if (copy.content) copy.content = cleanPortableText(copy.content)
  if (copy.displayStyle) copy.displayStyle = stripInvisible(copy.displayStyle)
  if (copy.aspectRatio) copy.aspectRatio = stripInvisible(copy.aspectRatio)

  // images arrays
  if (Array.isArray(copy.images)) {
    copy.images = copy.images.map((img: any) => ({
      ...img,
      alt: stripInvisible(img.alt),
      caption: stripInvisible(img.caption),
      material: stripInvisible(img.material),
      dimensions: stripInvisible(img.dimensions),
      year: stripInvisible(img.year),
    }))
  }

  // single image
  if (copy.image) {
    copy.image = {
      ...copy.image,
      alt: stripInvisible(copy.image.alt),
      caption: stripInvisible(copy.image.caption),
    }
  }

  return copy
}
