import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons'

export const productions = defineType({
  name: 'productions',
  title: 'Productions',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'titleImage',
      title: 'Productions Title Image',
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
      title: 'Featured Professional Projects',
      type: 'array',
      description: 'Select professional projects to showcase on the Productions page',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              options: {
                filter: 'projectKind == "professional" && defined(visible) && visible == true',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'titlePosition',
              title: 'Title Image Position',
              type: 'string',
              options: {
                list: [
                  {title: 'Top Left', value: 'top-left'},
                  {title: 'Top Right', value: 'top-right'},
                  {title: 'Middle Left', value: 'middle-left'},
                  {title: 'Middle Right', value: 'middle-right'},
                  {title: 'Bottom Left', value: 'bottom-left'},
                  {title: 'Bottom Right', value: 'bottom-right'},
                ],
                layout: 'dropdown',
              },
              initialValue: 'top-left',
              description: 'Where to position the title image over the cover image',
            }),
            defineField({
              name: 'offsetY',
              title: 'Vertical Offset',
              type: 'number',
              description: 'Move up (negative) or down (positive). Range: -200 to 200',
              validation: (Rule) => Rule.min(-200).max(200),
              initialValue: 0,
            }),
            defineField({
              name: 'offsetX',
              title: 'Horizontal Offset',
              type: 'number',
              description: 'Move left (negative) or right (positive). Range: -100 to 100',
              validation: (Rule) => Rule.min(-100).max(100),
              initialValue: 0,
            }),
            defineField({
              name: 'rotation',
              title: 'Rotation',
              type: 'number',
              description: 'Rotate the image. Range: -20 to 20 degrees',
              validation: (Rule) => Rule.min(-20).max(20),
              initialValue: 0,
            }),
            defineField({
              name: 'scale',
              title: 'Size',
              type: 'number',
              description: 'Make it bigger or smaller. Range: 0.7 to 1.5',
              validation: (Rule) => Rule.min(0.7).max(1.5),
              initialValue: 1,
            }),
            defineField({
              name: 'zIndex',
              title: 'Layer (Z-Index)',
              type: 'number',
              description: 'Higher numbers appear on top. Range: 0 to 50',
              validation: (Rule) => Rule.min(0).max(50),
              initialValue: 0,
            }),
          ],
          preview: {
            select: {
              title: 'project.title',
              media: 'project.coverImage',
              position: 'titlePosition',
              offsetY: 'offsetY',
              rotation: 'rotation',
              scale: 'scale',
            },
            prepare({title, media, position, offsetY, rotation, scale}) {
              return {
                title: title || 'Untitled Project',
                subtitle: `${position || 'top-left'} • Y: ${offsetY || 0}px, Rot: ${rotation || 0}°, Scale: ${scale || 1}x`,
                media,
              }
            },
          },
        },
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Productions',
      }
    },
  },
})
