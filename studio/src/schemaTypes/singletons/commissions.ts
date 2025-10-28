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
      name: 'introduction',
      title: 'Introduction',
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
      description: 'General information about your commission process',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Service Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
            {
              name: 'priceRange',
              title: 'Price Range',
              type: 'string',
              description: 'E.g., "From €500" or "€1000-2000"',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'priceRange',
            },
          },
        },
      ],
      description: 'Different types of commissions you offer',
    }),
    defineField({
      name: 'process',
      title: 'Commission Process',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'step',
              title: 'Step Number',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: 'title',
              title: 'Step Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'step',
            },
            prepare({title, subtitle}) {
              return {
                title: title,
                subtitle: `Step ${subtitle}`,
              }
            },
          },
        },
      ],
      description: 'Steps in your commission process',
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'text',
      rows: 3,
      description: 'How potential clients can get in touch',
    }),
    defineField({
      name: 'showContactForm',
      title: 'Show Contact Form',
      type: 'boolean',
      description: 'Enable a contact form on the commissions page',
      initialValue: true,
    }),
    defineField({
      name: 'featuredCommissions',
      title: 'Featured Commissions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'project'}],
          options: {
            filter: 'projectType->slug.current == "commissions"',
          },
        },
      ],
      description: 'Highlight past commission projects',
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
