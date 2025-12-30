'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import StackedCategoryTitles, {
  CategoryItem,
  GroupTitleImages,
  TitleVariant,
} from './StackedCategoryTitles'

function getHeaderOffsetPx() {
  return 110
}

export default function ProjectSectionsStackedNavClient({
  categories,
  titleVariant = 'stacked',
  groupTitleImages,
}: {
  categories: CategoryItem[]
  titleVariant?: TitleVariant
  groupTitleImages?: GroupTitleImages
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const ids = useMemo(() => categories.map((c) => c.id), [categories])

  // When true, we ignore IntersectionObserver updates (prevents flicker during smooth scroll)
  const lockRef = useRef(false)
  const unlockTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // Unlock when scroll settles near the intended target
  const unlockWhenSettled = (targetY: number) => {
    clearTimers()

    const check = () => {
      const diff = Math.abs(window.scrollY - targetY)
      if (diff < 2) {
        lockRef.current = false
        rafRef.current = null
        return
      }
      rafRef.current = requestAnimationFrame(check)
    }

    rafRef.current = requestAnimationFrame(check)

    // Safety: unlock even if something interrupts smooth scrolling
    unlockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false
    }, 900)
  }

  // Scroll to section on click
  const onSelectCategory = (id: string | null) => {
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return

    // 1) Set active immediately (no flicker)
    setActiveId(id)

    // 2) Lock observer updates while scrolling
    lockRef.current = true

    const targetY =
      el.getBoundingClientRect().top + window.scrollY - getHeaderOffsetPx()

    // keep URL in sync (optional)
    window.history.replaceState({}, '', `#${id}`)

    // 3) Smooth scroll
    window.scrollTo({ top: targetY, behavior: 'smooth' })

    // 4) Unlock once we’ve arrived (or after timeout)
    unlockWhenSettled(targetY)
  }

  // Highlight current section while scrolling
  useEffect(() => {
    if (!ids.length) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (!elements.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        // If we are programmatically scrolling, ignore observer updates
        if (lockRef.current) return

        const visible = entries.filter((e) => e.isIntersecting)
        if (!visible.length) return

        visible.sort((a, b) => {
          const ay = Math.abs(
            (a.boundingClientRect?.top ?? 0) - getHeaderOffsetPx()
          )
          const by = Math.abs(
            (b.boundingClientRect?.top ?? 0) - getHeaderOffsetPx()
          )
          return ay - by
        })

        const id = (visible[0].target as HTMLElement).id
        if (id) setActiveId(id)
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: `-${getHeaderOffsetPx()}px 0px -70% 0px`,
      }
    )

    elements.forEach((el) => obs.observe(el))

    return () => obs.disconnect()
  }, [ids])

  // Initial active from hash (only if hash exists)
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '') || ''
    if (hash && ids.includes(hash)) setActiveId(hash)
    else setActiveId(null) // important: no default “first active”
  }, [ids])

  // Cleanup timers/raf
  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <StackedCategoryTitles
      hideGroupTitle
      titleVariant={titleVariant}
      groupTitleImages={groupTitleImages}
      categories={categories}
      selectedCategory={activeId}
      onSelectCategory={onSelectCategory}
    />
  )
}
