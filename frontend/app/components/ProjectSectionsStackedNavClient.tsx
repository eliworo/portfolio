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
  projectTitle,
  projectTitleTargetId,
  mobileCategoryNavRevealTargetId,
}: {
  categories: CategoryItem[]
  titleVariant?: TitleVariant
  groupTitleImages?: GroupTitleImages
  projectTitle?: {
    title: string
    titleImageUrl?: string
    brushColor?: string
  }
  projectTitleTargetId?: string
  mobileCategoryNavRevealTargetId?: string
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showProjectTitle, setShowProjectTitle] = useState(false)
  const [showMobileCategoryNav, setShowMobileCategoryNav] = useState(
    !mobileCategoryNavRevealTargetId,
  )
  const [showScrollTopButton, setShowScrollTopButton] = useState(false)
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

    const TOLERANCE_PX = 10

    const check = () => {
      const diff = Math.abs(window.scrollY - targetY)
      if (diff <= TOLERANCE_PX) {
        lockRef.current = false
        rafRef.current = null
        return
      }
      rafRef.current = requestAnimationFrame(check)
    }

    rafRef.current = requestAnimationFrame(check)

    // Unlock if user interrupts momentum / scroll
    const unlockNow = () => {
      lockRef.current = false
      window.removeEventListener('wheel', unlockNow)
      window.removeEventListener('touchstart', unlockNow)
    }

    window.addEventListener('wheel', unlockNow, { passive: true })
    window.addEventListener('touchstart', unlockNow, { passive: true })

    unlockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false
    }, 1200)
  }

  // Scroll to section on click
  const onSelectCategory = (id: string | null) => {
    if (!id) {
      // Support toggle-off: clear active state
      setActiveId(null)
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    const el = document.getElementById(id)
    if (!el) return

    // 1) Set active immediately (no flicker)
    setActiveId(id)

    // 2) Lock observer updates while scrolling
    lockRef.current = true

    const targetY =
      el.getBoundingClientRect().top + window.scrollY - getHeaderOffsetPx()

    // keep URL in sync
    window.history.replaceState({}, '', `#${id}`)

    // 3) Smooth scroll
    window.scrollTo({ top: targetY, behavior: 'smooth' })

    // 4) Unlock once we've arrived (or after timeout)
    unlockWhenSettled(targetY)
  }

  const onSelectProjectTitle = () => {
    setActiveId(null)
    lockRef.current = true
    window.history.replaceState({}, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    unlockWhenSettled(0)
  }

  useEffect(() => {
    if (!projectTitleTargetId) return

    let raf: number | null = null

    const update = () => {
      raf = null
      const el = document.getElementById(projectTitleTargetId)
      if (!el) {
        setShowProjectTitle(false)
        return
      }

      setShowProjectTitle(el.getBoundingClientRect().bottom <= 0)
    }

    const requestUpdate = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    requestUpdate()
    const timer = window.setTimeout(requestUpdate, 150)

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [projectTitleTargetId])

  useEffect(() => {
    if (!mobileCategoryNavRevealTargetId) {
      setShowMobileCategoryNav(true)
      return
    }

    let raf: number | null = null

    const update = () => {
      raf = null
      const el = document.getElementById(mobileCategoryNavRevealTargetId)
      if (!el) {
        setShowMobileCategoryNav(true)
        return
      }

      setShowMobileCategoryNav(el.getBoundingClientRect().bottom <= 0)
    }

    const requestUpdate = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    requestUpdate()
    const timer = window.setTimeout(requestUpdate, 150)

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mobileCategoryNavRevealTargetId])

  useEffect(() => {
    let raf: number | null = null

    const update = () => {
      raf = null
      setShowScrollTopButton(window.scrollY > 160)
    }

    const requestUpdate = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Highlight current section while scrolling
  useEffect(() => {
    if (!ids.length) return

    const headerOffset = getHeaderOffsetPx()

    const getSectionTops = () =>
      ids
        .map((id) => {
          const el = document.getElementById(id)
          if (!el) return null
          const top = el.getBoundingClientRect().top + window.scrollY
          return { id, top }
        })
        .filter(Boolean) as { id: string; top: number }[]

    let tops = getSectionTops()

    // Get the credits section to detect when we've scrolled past all categories
    const getCreditsTop = () => {
      const creditsEl = document.querySelector('[data-credits-section]')
      if (!creditsEl) return null
      return creditsEl.getBoundingClientRect().top + window.scrollY
    }

    let creditsTop = getCreditsTop()

    // Recompute tops on resize (layout changes)
    const onResize = () => {
      tops = getSectionTops()
      creditsTop = getCreditsTop()
    }
    window.addEventListener('resize', onResize)

    let raf: number | null = null

    const onScroll = () => {
      if (lockRef.current) return

      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null

        const ACTIVATION = 0.6

        const activationY =
          window.scrollY +
          headerOffset +
          (window.innerHeight - headerOffset) * ACTIVATION

        // If we've scrolled past all sections and into credits area, clear active
        if (creditsTop && activationY >= creditsTop) {
          setActiveId(null)
          // Clear hash from URL when scrolling to credits
          if (window.location.hash) {
            window.history.replaceState({}, '', window.location.pathname)
          }
          return
        }

        // Above first section => none active
        if (tops.length && activationY < tops[0].top) {
          setActiveId(null)
          return
        }

        // Find last section whose top <= activationY
        let current: string | null = null
        for (let i = 0; i < tops.length; i++) {
          if (tops[i].top <= activationY) current = tops[i].id
          else break
        }
        setActiveId(current)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Initialize immediately
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ids])

  // Initial active from hash (only if hash exists)
  useEffect(() => {
    const hash = window.location.hash?.replace('#', '') || ''
    if (hash && ids.includes(hash)) {
      setActiveId(hash)
    } else {
      setActiveId(null)
    }
  }, [ids])

  // Cleanup timers/raf
  useEffect(() => {
    return () => clearTimers()
  }, [])

  return (
    <StackedCategoryTitles
      hideGroupTitle
      showAllCategories={false}
      titleVariant={titleVariant}
      groupTitleImages={groupTitleImages}
      projectTitle={projectTitle}
      showProjectTitle={showProjectTitle}
      showMobileCategoryNav={showMobileCategoryNav}
      showScrollTopButton={showScrollTopButton}
      onSelectProjectTitle={onSelectProjectTitle}
      onScrollToTop={onSelectProjectTitle}
      categories={categories}
      selectedCategory={activeId}
      onSelectCategory={onSelectCategory}
    />
  )
}
