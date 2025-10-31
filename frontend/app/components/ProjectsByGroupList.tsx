'use client'

import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import CategoryNav from './CategoryNav'

interface Project {
  _id: string
  title?: string
  slug?: { current?: string }
  coverImage?: {
    asset?: { url?: string }
    alt?: string
  }
}

interface ProjectsByGroupListProps {
  projects: Project[]
  groupSlug: string
  isStudioWorks?: boolean
}

export default function ProjectsByGroupList({
  projects,
  groupSlug,
  isStudioWorks = false,
}: ProjectsByGroupListProps) {
  const navItems = projects.map((project) => ({
    id: project._id,
    title: project.title || 'Untitled',
    slug: project.slug?.current,
  }))

  return (
    <>
      {/* Navigation - shows projects and links directly to them */}
      {navItems.length > 0 && (
        <CategoryNav
          items={navItems}
          title='woronoff by project'
          isStudioWorks={false}
          groupSlug={groupSlug}
        />
      )}

      {/* Projects Grid */}
      <div className='columns-[400px] gap-2 py-64'>
        <AnimatePresence mode='popLayout'>
          {projects.map((project, idx) => (
            <motion.div
              key={project._id}
              style={{
                marginBottom: `${Math.random() * 20 + 10}px`,
                marginLeft: `${Math.random() * 10}px`,
                marginRight: `${Math.random() * 10}px`,
              }}
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
