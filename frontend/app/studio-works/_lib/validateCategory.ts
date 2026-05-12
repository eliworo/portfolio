import { redirect } from 'next/navigation'

const CORE_KEY_LEN = 12

const coreKey = (key?: string) => (key || '').slice(0, CORE_KEY_LEN)

const isLargePersonalProject = (project: any) =>
  project?.projectKind === 'personal' && project?.projectSize === 'large'

const addCategorySlug = (out: Set<string>, category: any) => {
  const slug = category?.slug?.current
  if (slug) out.add(slug)
}

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
      addCategorySlug(out, sec?.category)
      continue
    }

    // A large personal project can be curated as a whole project. In that case
    // let it appear under each of its category sections.
    if (
      isLargePersonalProject(project) &&
      Array.isArray(project.categorySections)
    ) {
      for (const sec of project.categorySections) {
        addCategorySlug(out, sec?.category)
      }
      continue
    }

    // Small personal projects with categories
    if (
      project.projectKind === 'personal' &&
      project.projectSize !== 'large' &&
      Array.isArray(project.categories)
    ) {
      for (const cat of project.categories) {
        addCategorySlug(out, cat)
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
