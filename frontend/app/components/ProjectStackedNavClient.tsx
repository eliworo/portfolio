'use client'

import { useEffect, useState } from 'react'
import StackedCategoryTitles, {
  CategoryItem,
  GroupTitleImages,
  TitleVariant,
} from './StackedCategoryTitles'

export default function ProjectStackedNavClient({
  titleVariant = 'stacked',
  groupTitle,
  groupTitleImages,
  categories,
}: {
  titleVariant?: TitleVariant
  groupTitle?: string
  groupTitleImages?: GroupTitleImages
  categories: CategoryItem[]
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Keep activeId in sync with URL hash (basic version)
  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash?.replace('#', '') || ''
      setActiveId(id || null)
    }
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])

  const onSelectCategory = (id: string | null) => {
    if (!id) return

    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Update hash without a full navigation
    window.history.replaceState({}, '', `#${id}`)
    setActiveId(id)
  }

  return (
    <StackedCategoryTitles
      titleVariant={titleVariant}
      groupTitle={groupTitle}
      groupTitleImages={groupTitleImages}
      categories={categories}
      selectedCategory={activeId}
      onSelectCategory={onSelectCategory}
    />
  )
}
