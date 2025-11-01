'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import CategoryNav from './CategoryNav'
import { ProjectGroupQueryResult } from '@/sanity.types'

interface FilterableProjectsListProps {
  projects: NonNullable<ProjectGroupQueryResult>['projects']
  groupSlug?: string
  isFeaturedProjectsPage?: boolean
}

export default function FilterableProjectsList({
  projects,
  groupSlug,
  isFeaturedProjectsPage = false,
}: FilterableProjectsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState(projects)

  const allCategories = projects
    .flatMap(
      (project) =>
        project.categories
          ?.filter((cat) => cat && cat._id && cat.slug?.current)
          .map((cat) => ({
            id: cat.slug?.current || '',
            title: cat.title || 'Untitled',
            titleImageUrl: cat?.titleImage?.asset?.url || undefined,
          })) || []
    )
    .filter(
      (cat, index, self) =>
        cat.id && index === self.findIndex((c) => c.id === cat.id)
    )

  const allProjects = projects.map((project) => ({
    id: project._id,
    title: project.title || 'Untitled',
    slug: project.slug,
    titleImageUrl: project.titleImage?.asset?.url || undefined,
  }))

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

  const isStudioWorks = groupSlug === 'studio-works'
  const categoryTitle = isStudioWorks
    ? 'woronoff by category'
    : 'woronoff by project'

  return (
    <>
      {(isStudioWorks ? allCategories : allProjects).length > 0 && (
        <CategoryNav
          items={isStudioWorks ? allCategories : allProjects}
          title={categoryTitle}
          isStudioWorks={isStudioWorks}
          groupSlug={groupSlug}
        />
      )}

      <div className='columns-[180px] lg:columns-[400px] gap-2 py-40 lg:py-64'>
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((project, idx) => {
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                layout
              >
                <Link href={`/${groupSlug}/${project.slug}`}>
                  {project.coverImage?.asset?.url && (
                    <Image
                      src={project.coverImage.asset.url}
                      alt={project.coverImage.alt || project.title || ''}
                      width={300}
                      height={400}
                      className='w-full h-auto object-cover'
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}
