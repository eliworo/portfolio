import { redirect } from 'next/navigation'

const CORE_KEY_LEN = 12

const coreKey = (key?: string) => (key || '').slice(0, CORE_KEY_LEN)

export function collectAllowedCategories(featured: any[]): Set<string> {
  const out = new Set<string>()

  for (const item of featured || []) {
    const project = item?.project
    if (!project) continue

    // Professional projects OR large personal projects with category sections
    if (
      item?.categorySectionKey &&
      (project.projectKind === 'professional' ||
        (project.projectKind === 'personal' && project.projectSize === 'large'))
    ) {
      const ck = coreKey(item.categorySectionKey)
      const sec = project.categorySections?.find((s: any) =>
        s?._key?.startsWith(ck)
      )
      const slug = sec?.category?.slug?.current
      if (slug) out.add(slug)
      continue
    }

    // Small personal projects with categories
    if (
      project.projectKind === 'personal' &&
      project.projectSize !== 'large' &&
      Array.isArray(project.categories)
    ) {
      for (const cat of project.categories) {
        const slug = cat?.slug?.current
        if (slug) out.add(slug)
      }
    }
  }

  return out
}

export function assertValidCategoryOrRedirect(params: {
  category?: string
  featuredProjects: any[]
  redirectTo?: string
}) {
  const { category, featuredProjects, redirectTo = '/studio-works' } = params
  if (!category) return

  const allowed = collectAllowedCategories(featuredProjects)
  if (!allowed.has(category)) redirect(redirectTo)
}
