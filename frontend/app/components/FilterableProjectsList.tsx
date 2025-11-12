'use client'
import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import CategoryNav from './CategoryNav'
import { ProjectGroupQueryResult } from '@/sanity.types'

interface FilterableProjectsListProps {
  projects: NonNullable<ProjectGroupQueryResult>['projects']
  groupSlug?: string
  isFeaturedProjectsPage?: boolean
  groupTitleImageUrl?: string
  groupTitle?: string
}

export default function FilterableProjectsList({
  projects,
  groupSlug,
  isFeaturedProjectsPage = false,
  groupTitleImageUrl,
  groupTitle,
}: FilterableProjectsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [isPending, startTransition] = useTransition()

  // build category / project lists for nav
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

  // read initial category from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('category')
      if (cat) setSelectedCategory(cat)
    } catch {
      /* noop (SSR guard) */
    }
  }, [])

  // update filteredProjects when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProjects(projects)
      return
    }

    startTransition(() => {
      setFilteredProjects(
        projects.filter((project) =>
          project.categories?.some(
            (cat) => cat.slug?.current === selectedCategory
          )
        )
      )
    })
  }, [selectedCategory, projects])

  // handler for nav selection: update state + URL (no navigation)
  const handleSelectCategory = (id: string | null) => {
    // update URL query param without navigation
    try {
      const url = new URL(window.location.href)
      if (id) url.searchParams.set('category', id)
      else url.searchParams.delete('category')
      window.history.replaceState({}, '', url.toString())
    } catch {
      /* noop */
    }

    startTransition(() => {
      setSelectedCategory(id)
    })
  }

  const isStudioWorks = groupSlug === 'studio-works'
  const categoryTitle = isStudioWorks
    ? 'woronoff by category'
    : 'woronoff by project'

  // Get current display image (category or group)
  const currentCategory = selectedCategory
    ? allCategories.find((c) => c.id === selectedCategory)
    : null

  return (
    <>
      {(isStudioWorks ? allCategories : allProjects).length > 0 && (
        <CategoryNav
          items={isStudioWorks ? allCategories : allProjects}
          title={categoryTitle}
          isStudioWorks={isStudioWorks}
          groupSlug={groupSlug}
          onSelectCategory={handleSelectCategory}
          onSelectItem={handleSelectCategory}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Title Image Swap - fades between group title and category title */}
      <div className='px-4 lg:px-0 lg:mb-8 fixed -rotate-3 lg:rotate-0 left-0 lg:left-22 top-23 lg:top-16 z-20 w-full lg:w-[40vw]'>
        <AnimatePresence mode='wait'>
          {currentCategory?.titleImageUrl ? (
            // Category title image
            <motion.div
              key={`category-${currentCategory.id}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={currentCategory.titleImageUrl}
                alt={currentCategory.title}
                width={600}
                height={200}
                className='object-contain h-auto'
              />
            </motion.div>
          ) : groupTitleImageUrl ? (
            // Group title image
            <motion.div
              key='group-title'
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={groupTitleImageUrl}
                alt={groupTitle || 'Project Group Title'}
                width={600}
                height={200}
                className='object-contain h-auto'
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className='columns-[180px] lg:columns-[400px] gap-2 py-40 lg:py-64'>
        <AnimatePresence mode='popLayout'>
          {filteredProjects.map((project, idx) => {
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                layout
              >
                <Link href={`/${groupSlug}/${project.slug}`}>
                  {project.coverImage?.asset?.url ? (
                    <Image
                      src={project.coverImage.asset.url}
                      alt={project.coverImage.alt || project.title || ''}
                      width={300}
                      height={400}
                      className='w-full h-auto object-cover'
                    />
                  ) : (
                    <div className='w-full h-[300px] bg-gray-100' />
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
