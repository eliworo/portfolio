'use client'

import { usePathname } from 'next/navigation'
import { VisualEditing } from 'next-sanity/visual-editing'

export default function VisualEditingGate() {
  const pathname = usePathname()

  // Sanity's overlay runtime recurses on the highly interactive Studio Works UI.
  // Keep draft mode/live preview enabled, but disable the clickable overlay there.
  if (
    pathname === '/studio-works' ||
    pathname?.startsWith('/studio-works/')
  ) {
    return null
  }

  return <VisualEditing />
}
