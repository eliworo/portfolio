import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'
import {orderRankField} from '@sanity/orderable-document-list'

export const projectType = defineType({
  name: 'projectType',
  title: 'Project Type',
  type: 'document',
  icon: TagIcon,
  fields: [
    orderRankField({type: 'projectType'}),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleImage',
      title: 'Title Image',
      type: 'image',
      description: 'Handwritten/designed title for this project group (displayed in navigation)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional — shown in the UI or on landing pages.',
    }),
    defineField({
      name: 'visibleInNav',
      title: 'Show in Navigation',
      type: 'boolean',
      initialValue: true,
      description: 'Control whether this group appears in the main menu.',
    }),
    // defineField({
    //   name: 'order',
    //   title: 'Order',
    //   type: 'number',
    //   description: 'Controls menu or homepage display order (lower = first)',
    // }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'titleImage',
    },
  },
})
