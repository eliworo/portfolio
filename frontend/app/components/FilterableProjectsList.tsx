'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import CategoryNav from './CategoryNav'
import { ProjectGroupQueryResult } from '@/sanity.types'

interface Project {
  _id: string
  title: string | null
  slug: { current: string | null }
  coverImage?: { asset?: { url?: string | null }; alt?: string | null }
  titleImage?: { asset?: { url?: string | null } }
  categories?: Array<{
    _id: string
    title: string | null
    titleImage?: { asset?: { url?: string | null } }
  }>
  projectType?: { slug?: { current?: string | null } }
  year?: string | null
}

interface FilterableProjectsListProps {
  projects: NonNullable<ProjectGroupQueryResult>['projects']
  groupSlug?: string
  isFeaturedProjectsPage?: boolean
}

interface ProjectCardProps {
  project: Project
  groupSlug?: string
  isFeaturedProjectsPage?: boolean
  idx: number
}

export default function FilterableProjectsList({
  projects,
  groupSlug,
  isFeaturedProjectsPage = false,
}: FilterableProjectsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState(projects)

  // Extract all unique categories from projects
  const allCategories = projects
    .flatMap(
      (project) =>
        project.categories
          ?.filter((cat) => cat && cat._id) // Filter out null/undefined categories
          .map((cat) => ({
            id: cat._id,
            title: cat.title || 'Untitled',
            titleImageUrl: cat?.titleImage?.asset?.url,
          })) || []
    )
    .filter(
      (cat, index, self) =>
        cat.id && // Ensure ID exists
        index === self.findIndex((c) => c.id === cat.id)
    )

  // Filter projects when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          project.categories?.some((cat) => cat._id === selectedCategory)
        )
      )
    }
  }, [selectedCategory, projects])

  // More creative positioning for featured projects
  const getPositionStyles = (idx: number) => {
    // Create artistic collage-style positioning
    // More variation for featured projects page
    const basePositions = isFeaturedProjectsPage
      ? [5, 25, 45, 65, 15, 35, 55] // More positions for featured page
      : [10, 50, 40, 55, 70] // Original positions

    const position = idx % basePositions.length
    const horizontalPos = basePositions[position]

    // Vary vertical spacing slightly for a more organic feel
    const verticalOffset = isFeaturedProjectsPage
      ? (idx % 3) * 200 - 30 // More vertical variation for featured
      : 0

    const top = idx * 320 + 20 + verticalOffset

    // Add slight rotation for featured projects
    const rotation = isFeaturedProjectsPage
      ? ((idx % 5) - 2) * 1.2 // Slight rotation between -2.4° and +2.4°
      : 0

    return {
      top: `${top}px`,
      left: `${horizontalPos}vw`,
      transform: rotation ? `rotate(${rotation}deg)` : 'none',
      zIndex: 10 + idx,
    }
  }

  return (
    <>
      {/* Category Navigation - Only show if there are categories */}
      {allCategories.length > 0 && (
        <CategoryNav
          categories={allCategories}
          onSelectCategory={(id) =>
            setSelectedCategory(id === selectedCategory ? null : id)
          }
          selectedCategory={selectedCategory}
        />
      )}

      <div
        className='relative w-full'
        style={{ minHeight: `${filteredProjects.length * 350}px` }}
      >
        <AnimatePresence>
          {filteredProjects.map((project, idx) => {
            const positionStyles = getPositionStyles(idx)

            return (
              <motion.div
                key={project._id}
                className='absolute'
                style={positionStyles}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard
                  project={project}
                  groupSlug={groupSlug}
                  isFeaturedProjectsPage={isFeaturedProjectsPage}
                  idx={idx}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

function ProjectCard({
  project,
  groupSlug,
  isFeaturedProjectsPage,
  idx,
}: ProjectCardProps) {
  const href = isFeaturedProjectsPage
    ? `/works/${project.projectType?.slug?.current}/${project.slug.current}`
    : `/works/${groupSlug}/${project.slug.current}`

  const overlayStyles = [
    { justify: 'start', align: 'top', rotate: '0deg', x: '20%', y: '50%' },
    { justify: 'end', align: 'bottom', rotate: '-6deg', x: '90%', y: '80%' },
    { justify: 'center', align: 'center', rotate: '-2deg', x: '50%', y: '50%' },
    { justify: 'start', align: 'bottom', rotate: '8deg', x: '10%', y: '85%' },
    { justify: 'end', align: 'top', rotate: '-8deg', x: '85%', y: '10%' },
  ]
  const overlay = overlayStyles[idx % overlayStyles.length]

  return (
    <Link href={href} className='group block'>
      <div className='relative shadow-md hover:shadow-xl transition-all duration-300'>
        {project.coverImage?.asset?.url && (
          <div className='relative w-[30vw] h-auto'>
            <Image
              src={project.coverImage.asset.url}
              alt={project.coverImage.alt || project.title}
              height={2000}
              width={1500}
              className='object-cover group-hover:scale-105 transition-transform duration-500'
            />

            {/* Title image overlay */}
            {project.titleImage?.asset?.url && (
              <div
                className={`absolute`}
                style={{
                  left: overlay.x,
                  top: overlay.y,
                  transform: `translate(-50%, -50%) rotate(${overlay.rotate})`,
                  display: 'flex',
                  justifyContent: overlay.justify,
                  alignItems: overlay.align,
                  width: '80%',
                  height: 'auto',
                }}
              >
                <Image
                  src={project.titleImage.asset.url}
                  alt={project.title}
                  width={400}
                  height={150}
                  className='drop-shadow-md max-w-full max-h-full object-contain'
                />
              </div>
            )}

            {/* Year/date tag */}
            {/* {project.year && (
              <div className='absolute bottom-4 right-4 bg-white/80 px-3 py-1 text-sm font-medium'>
                {project.year}
              </div>
            )} */}
          </div>
        )}
      </div>
    </Link>
  )
}
