import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'

export const categorySection = defineType({
  name: 'categorySection',
  title: 'Category Section',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'The category this section relates to',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Section Content',
      type: 'array',
      description: 'Content blocks for this category section',
      of: [
        {type: 'textBlock'},
        {type: 'imageBlock'},
        {type: 'imageGallery'},
        {type: 'textWithImage'},
        {type: 'videoBlock'},
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'category.title',
      media: 'category.icon',
    },
    prepare({title, media}) {
      return {
        title: title || 'Uncategorized Section',
        subtitle: 'Category Section',
        media: media || TagIcon,
      }
    },
  },
})
