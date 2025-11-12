import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'
import {orderRankField} from '@sanity/orderable-document-list'
import CategorySectionSelect from '../../../components/CategorySectionSelect'

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
    defineField({
      name: 'featuredProjects',
      title: 'Projects to Display',
      type: 'array',
      description:
        'Curate personal projects or specific category sections from professional projects. Position each item freely.',
      of: [
        {
          type: 'object',
          name: 'featuredItem',
          fields: [
            defineField({
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              validation: (rule) => rule.required(),
              options: {
                filter: 'defined(visible) && visible == true',
              },
            }),
            defineField({
              name: 'categorySectionKey',
              title: 'Category Section (professional only)',
              type: 'string',
              description:
                'When a professional project is selected, choose which section to feature.',
              components: {input: CategorySectionSelect},
            }),
            defineField({
              name: 'offsetX',
              title: 'Horizontal Offset (px)',
              type: 'number',
              initialValue: 0,
            }),
            defineField({
              name: 'offsetY',
              title: 'Vertical Offset (px)',
              type: 'number',
              initialValue: 0,
            }),
            defineField({
              name: 'rotation',
              title: 'Rotation (deg)',
              type: 'number',
              initialValue: 0,
            }),
            defineField({
              name: 'scale',
              title: 'Scale',
              type: 'number',
              description: '1 = normal size',
              initialValue: 1,
            }),
            defineField({
              name: 'zIndex',
              title: 'Layer Order',
              type: 'number',
              initialValue: 0,
            }),
          ],
          preview: {
            select: {
              title: 'project.title',
              media: 'project.coverImage',
              kind: 'project.projectKind',
              section: 'categorySectionKey',
            },
            prepare({title, media, kind, section}) {
              const parts = [
                kind === 'professional' ? 'Professional' : 'Personal',
                section ? `Section: ${section}` : 'Full project',
              ].filter(Boolean)
              return {title: title || 'Untitled', subtitle: parts.join(' • '), media}
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'titleImage',
    },
  },
})
