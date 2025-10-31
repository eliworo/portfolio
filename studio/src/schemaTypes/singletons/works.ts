import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const works = defineType({
  name: 'works',
  title: 'Works page',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'titleImage',
      title: 'Works Title Image',
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredProjects',
      title: 'Featured Projects',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'project'}],
        },
      ],
      validation: (rule) => rule.unique(),
      description: 'Optional: Highlight specific projects at the top of the works page',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'titleImage',
    },
    prepare() {
      return {
        title: 'Works page',
      }
    },
  },
})
