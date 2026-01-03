'use client'

import React, { useEffect, useState } from 'react'
import CreativeProjectsList from '../components/CreativeProjectsList'

export default function StudioWorksClientList(props: any) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <CreativeProjectsList
      {...props}
      // mobile => CategoryNav, desktop => stacked titles
      useStackedTitles={!isMobile}
    />
  )
}
