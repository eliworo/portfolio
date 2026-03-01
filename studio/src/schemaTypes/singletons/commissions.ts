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
      type: 'text',
      rows: 4,
      description: 'A short quote or sentence to display at the top of the page.',
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
