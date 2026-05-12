import {useEffect, useState} from 'react'
import {type PreviewProps, useClient} from 'sanity'

export const CATEGORY_REF_PREVIEW_PREFIX = 'categoryRef:'

const titleCache = new Map<string, string>()

function getCategoryRef(description: PreviewProps['description']) {
  if (typeof description !== 'string') return undefined
  if (!description.startsWith(CATEGORY_REF_PREVIEW_PREFIX)) return undefined
  return description.slice(CATEGORY_REF_PREVIEW_PREFIX.length)
}

function withCategoryTitle(subtitle: PreviewProps['subtitle'], title?: string | null) {
  if (!title || typeof subtitle !== 'string') return subtitle
  return subtitle.replace(/Category: (Unknown|…)/, `Category: ${title}`)
}

export default function FeaturedProjectPreview(props: PreviewProps) {
  const client = useClient({apiVersion: '2023-10-01'})
  const categoryRef = getCategoryRef(props.description)
  const [categoryTitle, setCategoryTitle] = useState(
    categoryRef ? titleCache.get(categoryRef) || null : null,
  )

  useEffect(() => {
    if (!categoryRef) {
      setCategoryTitle(null)
      return
    }

    const cached = titleCache.get(categoryRef)
    if (cached) {
      setCategoryTitle(cached)
      return
    }

    let cancelled = false
    const publishedId = categoryRef.replace(/^drafts\./, '')

    client
      .fetch<string | null>(
        `*[_type == "category" && _id in [$id, "drafts." + $id]] | order(_id desc)[0].title`,
        {id: publishedId},
      )
      .then((title) => {
        if (cancelled || !title) return
        titleCache.set(categoryRef, title)
        setCategoryTitle(title)
      })
      .catch(() => {
        if (!cancelled) setCategoryTitle(null)
      })

    return () => {
      cancelled = true
    }
  }, [categoryRef, client])

  return props.renderDefault({
    ...props,
    description: undefined,
    subtitle: withCategoryTitle(props.subtitle, categoryTitle),
  })
}
