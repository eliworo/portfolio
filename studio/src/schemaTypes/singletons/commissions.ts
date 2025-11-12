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
              name: 'titleImage',
              title: 'Tool Title Image',
              type: 'image',
              description: 'Image for the tool title',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'subtitle',
              title: 'Subtitle',
              type: 'string',
              description: 'Short subtitle for the tool',
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
              description: 'Short descriptive text for the tool',
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
            defineField({
              name: 'rotation',
              title: 'Rotation',
              type: 'number',
              description: 'Rotate the card. Range: -15 to 15 degrees',
              validation: (Rule) => Rule.min(-15).max(15),
              initialValue: 0,
            }),
            defineField({
              name: 'scale',
              title: 'Size',
              type: 'number',
              description: 'Make it bigger or smaller. Range: 0.8 to 1.2',
              validation: (Rule) => Rule.min(0.8).max(1.2),
              initialValue: 1,
            }),
          ],
          preview: {
            select: {
              title: 'subtitle',
              media: 'titleImage',
              offsetY: 'offsetY',
              rotation: 'rotation',
            },
            prepare({title, media, offsetY, rotation}) {
              return {
                title: title || 'Untitled Tool',
                subtitle: `Y: ${offsetY || 0}px, Rotation: ${rotation || 0}°`,
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
