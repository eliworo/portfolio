import {defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons'

export const commissions = defineType({
  name: 'commissions',
  title: 'Commissions Page',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'titleImage',
      title: 'Commissions Title Image',
      type: 'image',
      description: 'Handwritten/painted "COMMISSIONS" title for the page header',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'array',
      description: 'Rich text quote displayed at the top of the page.',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'external',
                    options: {
                      list: [
                        {title: 'Internal', value: 'internal'},
                        {title: 'External', value: 'external'},
                      ],
                      layout: 'radio',
                    },
                  },
                  {
                    name: 'internalLink',
                    title: 'Internal slug',
                    description: 'Examples: about, productions, posts/my-post',
                    type: 'string',
                    hidden: ({parent}: any) => parent?.linkType !== 'internal',
                    validation: (Rule) =>
                      Rule.custom((value, context: any) => {
                        if (context.parent?.linkType === 'internal' && !value) {
                          return 'Internal slug is required when Link Type is Internal'
                        }
                        return true
                      }),
                  },
                  {
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}: any) => parent?.linkType !== 'external',
                    validation: (Rule) =>
                      Rule.custom((value, context: any) => {
                        if (context.parent?.linkType === 'external' && !value) {
                          return 'URL is required when Link Type is External'
                        }
                        return true
                      }),
                  },
                  {
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'tools',
      title: 'Tools',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Title for the tool',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'blockContent',
              description: 'Tool description (supports rich text)',
            }),
            defineField({
              name: 'image',
              title: 'Tool Image',
              type: 'image',
              description: 'Main image for the tool (will be blurred by default)',
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
              name: 'offsetY',
              title: 'Vertical Offset',
              type: 'number',
              description: 'Move up (negative) or down (positive). Range: -100 to 100',
              validation: (Rule) => Rule.min(-100).max(100),
              initialValue: 0,
            }),
            defineField({
              name: 'offsetX',
              title: 'Horizontal Offset',
              type: 'number',
              description: 'Move left (negative) or right (positive). Range: -50 to 50',
              validation: (Rule) => Rule.min(-50).max(50),
              initialValue: 0,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
              offsetY: 'offsetY',
            },
            prepare({title, media, offsetY}) {
              return {
                title: title || 'Untitled Tool',
                subtitle: `Y: ${offsetY || 0}px`,
                media,
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
        title: 'Commissions Page',
      }
    },
  },
})
