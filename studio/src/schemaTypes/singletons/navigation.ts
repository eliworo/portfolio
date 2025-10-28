import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'logoE',
      title: 'Logo E',
      type: 'image',
      description: 'The main "E" logo for homepage',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'mainItems',
      title: 'Main Navigation Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title (for reference)',
              type: 'string',
            },
            {
              name: 'slug',
              title: 'Link URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'logo',
              title: 'Hand-drawn Logo',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'subItems',
              title: 'Sub Navigation Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'title',
                      title: 'Title (for reference)',
                      type: 'string',
                    },
                    {
                      name: 'slug',
                      title: 'Link URL',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'logo',
                      title: 'Hand-drawn Logo',
                      type: 'image',
                      options: {
                        hotspot: true,
                      },
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Navigation Settings',
      }
    },
  },
})
