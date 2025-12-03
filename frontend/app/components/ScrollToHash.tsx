'use client'

import { useEffect } from 'react'

export default function ScrollToHash() {
  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash

    if (hash) {
      // Remove the # from the hash
      const id = hash.replace('#', '')

      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      }, 100)
    }
  }, [])

  return null
}
