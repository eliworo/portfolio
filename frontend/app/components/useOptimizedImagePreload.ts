'use client'

import { useEffect } from 'react'
import { buildOptimizedImageUrl } from '@/sanity/lib/optimizedImageUrl'

type PreloadCandidate =
  | string
  | null
  | undefined
  | {
      src?: string | null
      width?: number
      quality?: number
    }

type PreloadOptions = {
  enabled?: boolean
  width?: number
  quality?: number
  concurrency?: number
  timeout?: number
  eager?: boolean
}

const preloadedUrls = new Set<string>()
const inflightUrls = new Set<string>()

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => number
    cancelIdleCallback?: (handle: number) => void
  }

function normalizeCandidate(
  candidate: PreloadCandidate,
  width: number,
  quality: number,
) {
  if (!candidate) return null

  if (typeof candidate === 'string') {
    return buildOptimizedImageUrl(candidate, width, quality)
  }

  if (!candidate.src) return null

  return buildOptimizedImageUrl(
    candidate.src,
    candidate.width ?? width,
    candidate.quality ?? quality,
  )
}

export function useOptimizedImagePreload(
  candidates: PreloadCandidate[],
  {
    enabled = true,
    width = 480,
    quality = 70,
    concurrency = 3,
    timeout = 700,
    eager = false,
  }: PreloadOptions = {},
) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean }
      }
    ).connection
    if (connection?.saveData) return

    const urls = Array.from(
      new Set(
        candidates
          .map((candidate) => normalizeCandidate(candidate, width, quality))
          .filter(Boolean) as string[],
      ),
    ).filter((url) => !preloadedUrls.has(url) && !inflightUrls.has(url))

    if (!urls.length) return

    let cancelled = false
    let cursor = 0
    let active = 0
    const activeImages = new Set<HTMLImageElement>()

    const loadNext = () => {
      if (cancelled) return

      while (active < concurrency && cursor < urls.length) {
        const url = urls[cursor]
        cursor += 1

        if (!url || preloadedUrls.has(url) || inflightUrls.has(url)) continue

        active += 1
        inflightUrls.add(url)

        const image = new window.Image()
        activeImages.add(image)
        image.decoding = 'async'

        const finish = () => {
          activeImages.delete(image)
          preloadedUrls.add(url)
          inflightUrls.delete(url)
          active -= 1
          loadNext()
        }

        image.onload = finish
        image.onerror = finish
        image.src = url
      }
    }

    const start = () => loadNext()
    const idleWindow = window as IdleWindow
    const hasIdleCallback =
      typeof idleWindow.requestIdleCallback === 'function'
    let cancelScheduledStart = () => {}

    if (eager) {
      start()
    } else {
      const idleId: number =
        hasIdleCallback && idleWindow.requestIdleCallback
          ? idleWindow.requestIdleCallback(start, { timeout })
          : window.setTimeout(start, 0)

      cancelScheduledStart = () => {
        if (hasIdleCallback && idleWindow.cancelIdleCallback && idleId) {
          idleWindow.cancelIdleCallback(idleId)
        } else {
          window.clearTimeout(idleId)
        }
      }
    }

    return () => {
      cancelled = true
      activeImages.forEach((image) => {
        image.onload = null
        image.onerror = null
      })

      cancelScheduledStart()
    }
  }, [candidates, concurrency, eager, enabled, quality, timeout, width])
}
