'use client'

import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import CategoryNav from './CategoryNav'
import { CategoryProjectsQueryResult } from '@/sanity.types'

type CategoryProjects = NonNullable<CategoryProjectsQueryResult>
type ProjectItem = CategoryProjects['projects'][number]
type CategoryItem = CategoryProjects['allCategories'][number]

interface CategoryProjectsListProps {
  projects: ProjectItem[]
  allCategories: CategoryItem[]
  groupSlug: string
  currentCategorySlug: string
}

export default function CategoryProjectsList({
  projects,
  allCategories,
  groupSlug,
  currentCategorySlug,
}: CategoryProjectsListProps) {
  const categoryNavItems = allCategories.map((cat) => ({
    id: cat.slug?.current || cat._id,
    title: cat.title || 'Untitled',
    titleImageUrl: cat?.titleImage?.asset?.url ?? undefined,
  }))

  return (
    <>
      {categoryNavItems.length > 0 && (
        <CategoryNav
          categories={categoryNavItems}
          selectedCategory={currentCategorySlug}
          title='woronoff by category'
          isStudioWorks={true}
          groupSlug={groupSlug}
        />
      )}

      <div className='columns-[400px] gap-2 py-64'>
        <AnimatePresence mode='popLayout'>
          {projects.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              layout
            >
              <Link href={`/${groupSlug}/${project.slug?.current}`}>
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
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
