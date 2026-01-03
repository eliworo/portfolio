const stripInvisible = (s?: string) =>
  (s || '').replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '').trim()

const normalizeCategoryKey = (key: string) =>
  stripInvisible(key).substring(0, 12)

// This is intentionally "any"-tolerant so it matches your current Sanity payload.
// You can type it later if you want.
export function deriveCategoryMapFromFeatured(featured: any[]) {
  const map = new Map<
    string,
    { id: string; title: string; titleImageUrl?: string }
  >()

  for (const item of featured || []) {
    const p = item?.project
    if (!p) continue

    const isProfessional = String(p?.projectKind || '')
      .toLowerCase()
      .includes('professional')
    const isPersonal = String(p?.projectKind || '')
      .toLowerCase()
      .includes('personal')
    const isLargePersonal = isPersonal && p?.projectSize === 'large'

    // Professional OR large personal: derive from categorySections via categorySectionKey
    if (
      item?.categorySectionKey &&
      (isProfessional || isLargePersonal) &&
      Array.isArray(p?.categorySections)
    ) {
      const coreKey = normalizeCategoryKey(item.categorySectionKey)
      const sec = p.categorySections.find((s: any) =>
        String(s?._key || '').startsWith(coreKey)
      )
      const slug = sec?.category?.slug?.current
      if (slug && !map.has(slug)) {
        map.set(slug, {
          id: slug,
          title: sec.category.title,
          titleImageUrl: sec.category.titleImage?.asset?.url,
        })
      }
    }

    // Small personal: derive from project.categories
    if (isPersonal && !isLargePersonal && Array.isArray(p?.categories)) {
      for (const cat of p.categories) {
        const slug = cat?.slug?.current
        if (slug && !map.has(slug)) {
          map.set(slug, {
            id: slug,
            title: cat.title,
            titleImageUrl: cat.titleImage?.asset?.url,
          })
        }
      }
    }
  }

  return map
}
