import {FolderIcon} from '@sanity/icons'
import {defineType, defineField} from 'sanity'
import {format, parseISO} from 'date-fns'
import {orderRankField} from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: FolderIcon,

  fields: [
    orderRankField({type: 'project'}),
    defineField({
      name: 'projectKind',
      title: 'Project Type',
      type: 'string',
      options: {
        list: [
          {title: 'Professional', value: 'professional'},
          {title: 'Personal', value: 'personal'},
        ],
        layout: 'radio',
      },
      initialValue: 'professional',
      validation: (rule) => rule.required(),
    }),
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
      description: 'Handwritten/designed project title (used in navigation)',
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
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. 2023 or 2020–2022',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Group',
      type: 'reference',
      to: [{type: 'projectType'}],
      description: 'Group this project under Her Productions, Studio Works, etc.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Tags like performance, fashion, sculpture, etc.',
      hidden: ({parent}) => parent?.projectKind !== 'personal',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief intro or blurb for the project',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'content',
      title: 'Project Content',
      type: 'array',
      description: 'Build your project layout with flexible content blocks',
      of: [
        {type: 'textBlock'},
        {type: 'imageBlock'},
        {type: 'imageGallery'},
        {type: 'textWithImage'},
        {type: 'videoBlock'},
      ],
      options: {
        insertMenu: {
          groups: [
            {
              name: 'text',
              title: 'Text Layouts',
              of: ['textBlock', 'textWithImage'],
            },
            {
              name: 'media',
              title: 'Images & Media',
              of: ['imageBlock', 'imageGallery', 'videoBlock'],
            },
          ],
          views: [
            {name: 'list'},
            {name: 'grid', previewImageUrl: (schemaTypeName) => `/preview-${schemaTypeName}.png`},
          ],
        },
      },
    }),
    defineField({
      name: 'categorySections',
      title: 'Category Sections',
      type: 'array',
      description: 'Content organized by categories',
      of: [{type: 'categorySection'}],
      hidden: ({parent}) => parent?.projectKind !== 'professional',
    }),

    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
      ],
      hidden: ({parent}) => parent?.projectKind !== 'professional',
    }),
    defineField({
      name: 'press',
      title: 'Press',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
      ],
      hidden: ({parent}) => parent?.projectKind !== 'professional',
    }),
    defineField({
      name: 'tournee',
      title: 'Tournée',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H4', value: 'h4'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
      ],
      hidden: ({parent}) => parent?.projectKind !== 'professional',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'visible',
      title: 'Visible on Website',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      date: 'publishedAt',
      projectType: 'projectType.title',
    },
    prepare({title, media, date, projectType}) {
      const subtitleParts = [
        projectType && `Group: ${projectType}`,
        date && `Published: ${format(parseISO(date), 'yyyy')}`,
      ].filter(Boolean)

      return {
        title,
        media,
        subtitle: subtitleParts.join(' — '),
      }
    },
  },
})
