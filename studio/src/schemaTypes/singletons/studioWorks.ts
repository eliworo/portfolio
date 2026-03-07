import {defineField, defineType} from 'sanity'
import {StackCompactIcon, TextIcon} from '@sanity/icons'
import CategorySectionSelect from '../../../components/CategorySectionSelect'

export const studioWorks = defineType({
  name: 'studioWorks',
  title: 'Studio Works',
  type: 'document',
  icon: StackCompactIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'titles', title: 'Title Images'},
    {name: 'layout', title: 'Layout'},
  ],
  fields: [
    defineField({
      name: 'titleImage',
      title: 'Studio Works Title Image',
      type: 'image',
      group: 'titles',
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
      name: 'titleImageStudio',
      title: 'Title Image (Stacked) — STUDIO',
      type: 'image',
      group: 'titles',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative text'}],
    }),

    defineField({
      name: 'titleImageWorks',
      title: 'Title Image (Stacked) — WORKS',
      type: 'image',
      group: 'titles',
      options: {hotspot: true},
      fields: [{name: 'alt', type: 'string', title: 'Alternative text'}],
    }),

    defineField({
      name: 'description',
      title: 'Introduction Text',
      type: 'array',
      group: 'content',
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
      group: 'content',
      description:
        'Curate personal projects or specific category sections from professional/large personal projects. Position each item freely.',
      of: [
        {
          type: 'object',
          name: 'featuredItem',
          fields: [
            defineField({
              name: 'kind',
              title: 'Item Type',
              type: 'string',
              initialValue: 'project',
              options: {
                list: [
                  {title: 'Project', value: 'project'},
                  {title: 'Blank / Spacer', value: 'blank'},
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              // was required — remove that
              hidden: ({parent}) => (parent?.kind ?? 'project') === 'blank',
              options: {
                filter: 'defined(visible) && visible == true',
              },
              validation: (rule) =>
                rule.custom((value, ctx) => {
                  const kind = ((ctx.parent as any)?.kind ?? 'project') as string
                  if (kind === 'project' && !value) return 'Project is required for Project items'
                  return true
                }),
            }),
            defineField({
              name: 'blankLabel',
              title: 'Blank Label (optional)',
              type: 'string',
              description: 'Only used in Studio for identifying the spacer.',
              hidden: ({parent}) => (parent?.kind ?? 'project') === 'blank',
            }),
            defineField({
              name: 'blankSize',
              title: 'Blank Size',
              type: 'string',
              initialValue: 'md',
              options: {
                list: [
                  {title: 'Small', value: 'sm'},
                  {title: 'Medium', value: 'md'},
                  {title: 'Large', value: 'lg'},
                ],
              },
              hidden: ({parent}) => (parent?.kind ?? 'project') === 'blank',
            }),

            defineField({
              name: 'categorySectionKey',
              title: 'Category Section',
              type: 'string',
              description:
                'For professional projects or large personal projects: choose which category section to feature.',
              components: {input: CategorySectionSelect},
            }),
            defineField({
              name: 'hideOnDefaultList',
              title: 'Hide on default Studio Works list',
              type: 'boolean',
              initialValue: false,
              description:
                'If enabled, this item is hidden on /studio-works when no category is selected, but will still appear when its category is selected.',
              hidden: ({parent}) => (parent?.kind ?? 'project') === 'blank',
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
              itemKind: 'kind',
              blankLabel: 'blankLabel',
              blankSize: 'blankSize',

              // project-derived fields (will be undefined for blanks)
              title: 'project.title',
              media: 'project.coverImage',
              projectKind: 'project.projectKind',
              size: 'project.projectSize',
              subtype: 'project.projectSubtype',
              section: 'categorySectionKey',
              categorySections: 'project.categorySections',
            },
            prepare({
              itemKind,
              blankLabel,
              blankSize,
              title,
              media,
              projectKind,
              size,
              subtype,
              section,
              categorySections,
            }) {
              // 1) Blank/spacer preview
              if (itemKind === 'blank') {
                return {
                  title: blankLabel ? `Blank: ${blankLabel}` : 'Blank / Spacer',
                  subtitle: blankSize ? `Size: ${blankSize}` : 'Layout helper',
                  media: StackCompactIcon,
                }
              }

              // 2) Existing project logic (unchanged, just renamed variables)
              let typeLabel = ''
              let categoryLabel = null
              let previewMedia = media

              if (projectKind === 'professional') {
                typeLabel = 'Professional'
              } else if (projectKind === 'personal') {
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
    defineField({
      name: 'gridSpacing',
      title: 'Grid Spacing (Desktop)',
      type: 'object',
      group: 'layout',
      fields: [
        defineField({
          name: 'columnGap',
          title: 'Column Gap (px)',
          type: 'number',
          initialValue: 8,
          validation: (rule) => rule.min(0),
        }),
        defineField({
          name: 'rowGap',
          title: 'Row Gap (px)',
          type: 'number',
          initialValue: 8,
          validation: (rule) => rule.min(0),
        }),
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
