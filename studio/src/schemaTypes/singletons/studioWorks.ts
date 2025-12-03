import {defineField, defineType} from 'sanity'
import {StackCompactIcon, TextIcon} from '@sanity/icons'
import CategorySectionSelect from '../../../components/CategorySectionSelect'

export const studioWorks = defineType({
  name: 'studioWorks',
  title: 'Studio Works',
  type: 'document',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'titleImage',
      title: 'Studio Works Title Image',
      type: 'image',
      validation: (rule) => rule.required(),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Introduction Text',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
          },
        },
      ],
    }),
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
              size: 'project.projectSize',
              subtype: 'project.projectSubtype',
              section: 'categorySectionKey',
              categorySections: 'project.categorySections',
            },
            prepare({title, media, kind, size, subtype, section, categorySections}) {
              let typeLabel = ''
              let categoryLabel = null
              let previewMedia = media

              // Type label logic
              if (kind === 'professional') {
                typeLabel = 'Professional'
              } else if (kind === 'personal') {
                if (size === 'large') {
                  typeLabel = 'Personal (Large/Full Page)'
                } else if (size === 'small') {
                  if (subtype === 'writing') {
                    typeLabel = 'Personal (Writing/Modal)'
                    previewMedia = TextIcon
                  } else if (subtype === 'artwork') {
                    typeLabel = 'Personal (Artwork/Modal)'
                  } else {
                    typeLabel = 'Personal (Small/Modal)'
                  }
                } else {
                  typeLabel = 'Personal'
                }
              }

              // Match category section by key
              if (section && categorySections) {
                const sec = categorySections.find((s: any) => s._key?.startsWith(section))

                if (sec) {
                  categoryLabel = `Category: ${sec.category?.title || 'Unknown'}`

                  if (sec.preview?.mode === 'image' && sec.preview.image) {
                    previewMedia = sec.preview.image
                  } else if (sec.preview?.mode === 'text') {
                    previewMedia = TextIcon
                  }
                }
              }

              const parts = [typeLabel, categoryLabel].filter(Boolean)

              return {
                title: title || 'Untitled',
                subtitle: parts.join(' • '),
                media: previewMedia,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Studio Works',
      }
    },
  },
})
