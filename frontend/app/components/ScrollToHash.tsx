'use client'

import { useEffect, useRef } from 'react'

export default function ScrollToHash() {
  const hasScrolledRef = useRef(false)
  const userHasScrolledRef = useRef(false)

  useEffect(() => {
    const hash = window.location.hash

    if (!hash) return

    const id = hash.replace('#', '')

    const scrollToElement = () => {
      // Don't scroll if user has manually scrolled away
      if (userHasScrolledRef.current) return false

      const element = document.getElementById(id)
      if (element) {
        // Use instant scroll first, then smooth for better UX
        element.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        })
        // Small delay for smooth re-adjustment
        setTimeout(() => {
          if (!userHasScrolledRef.current) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }, 50)
        hasScrolledRef.current = true
        return true
      }
      return false
    }

    // More aggressive retry strategy - but only if user hasn't scrolled
    const attemptScroll = (attempt = 0) => {
      if (scrollToElement()) return

      // Retry up to 10 times with increasing delays
      if (attempt < 10 && !userHasScrolledRef.current) {
        const delay = attempt < 3 ? 100 : attempt < 6 ? 300 : 500
        setTimeout(() => attemptScroll(attempt + 1), delay)
      }
    }

    // Only attempt scroll if we haven't scrolled yet on this page load
    if (!hasScrolledRef.current) {
      attemptScroll()

      // Also try after any image loads
      const images = Array.from(document.querySelectorAll('img'))
      images.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', () => {
            if (!userHasScrolledRef.current) {
              setTimeout(scrollToElement, 100)
            }
          })
        }
      })
    }

    // Detect manual user scrolling
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // If user scrolled and we've already done initial scroll, mark as user-scrolled
        if (hasScrolledRef.current) {
          userHasScrolledRef.current = true
        }
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Listen for hash changes during navigation (when user clicks a different hash link)
    const handleHashChange = () => {
      hasScrolledRef.current = false
      userHasScrolledRef.current = false
      setTimeout(() => attemptScroll(), 100)
    }
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
      clearTimeout(scrollTimeout)
    }
  }, []) // Empty dependency array - only run once on mount

  return null
}
