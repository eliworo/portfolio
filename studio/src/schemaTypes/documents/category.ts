import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
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
      description: 'Optional — short explanation of the category’s scope.',
    }),
    // defineField({
    //   name: 'displayAsSection',
    //   title: 'Display as Section in Menu',
    //   type: 'boolean',
    //   initialValue: false,
    //   description:
    //     'Enable if this category should appear as its own menu item or route (e.g. Fashion Activism).',
    // }),
    // defineField({
    //   name: 'order',
    //   title: 'Order',
    //   type: 'number',
    //   description: 'Used to sort categories in UI filters or in the navigation menu.',
    // }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
