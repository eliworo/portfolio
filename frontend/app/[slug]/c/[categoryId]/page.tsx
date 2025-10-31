import Image from 'next/image'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import CategoryProjectsList from '@/app/components/CategoryProjectsList'
import { categoryProjectsQuery } from '@/sanity/lib/queries'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categoryId: string }>
}) {
  const { slug: groupSlug, categoryId } = await params

  const { data: category } = await sanityFetch({
    query: categoryProjectsQuery,
    params: {
      categorySlug: categoryId,
      groupSlug: groupSlug,
    },
  })

  if (!category) {
    notFound()
  }

  return (
    <main className='py-12 px-8 max-w-7xl mx-auto'>
      {category.titleImage?.asset?.url ? (
        <div className='mb-8 fixed left-22 top-16 z-20 w-[40vw]'>
          <Image
            src={category.titleImage.asset.url}
            alt={category.title || 'Category Title'}
            width={600}
            height={200}
            className='object-contain h-auto border-0 border-black'
          />
        </div>
      ) : (
        <h1 className='text-4xl font-bold mb-8'>{category.title}</h1>
      )}

      <CategoryProjectsList
        projects={category.projects}
        allCategories={category.allCategories}
        groupSlug={groupSlug}
        currentCategorySlug={categoryId}
      />
    </main>
  )
}
