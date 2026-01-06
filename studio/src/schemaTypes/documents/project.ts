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
      name: 'projectSize',
      title: 'Project Size',
      type: 'string',
      options: {
        list: [
          {title: 'Small (Modal only)', value: 'small'},
          {title: 'Large (Full page)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'small',
      hidden: ({parent}) => parent?.projectKind !== 'personal',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {projectKind?: string}
          if (parent?.projectKind === 'personal' && !value) {
            return 'Project size is required for personal projects'
          }
          return true
        }),
    }),
    defineField({
      name: 'projectSubtype',
      title: 'Project Subtype',
      type: 'string',
      options: {
        list: [
          {title: 'Artwork', value: 'artwork'},
          {title: 'Writing', value: 'writing'},
        ],
        layout: 'radio',
      },
      initialValue: 'artwork',
      hidden: ({parent}) =>
        !(parent?.projectKind === 'personal' && parent?.projectSize === 'small'),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {projectKind?: string; projectSize?: string}
          if (parent?.projectKind === 'personal' && parent?.projectSize === 'small' && !value) {
            return 'Project subtype is required for small personal projects'
          }
          return true
        }),
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
      hidden: ({parent}) => parent?.projectKind === 'personal' && parent?.projectSize === 'small',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {projectKind?: string; projectSize?: string}

          // Slug required for professional projects
          if (parent?.projectKind === 'professional' && !value) {
            return 'Slug is required for professional projects'
          }

          // Slug required for large personal projects
          if (parent?.projectKind === 'personal' && parent?.projectSize === 'large' && !value) {
            return 'Slug is required for large personal projects'
          }

          return true
        }),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. 2023 or 2020–2022',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Tags like performance, fashion, sculpture, etc.',
      hidden: ({parent}) => parent?.projectKind !== 'personal' || parent?.projectSize === 'large',
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief intro or blurb for the project',
      validation: (rule) => rule.max(220),
    }),

    defineField({
      name: 'brushColor',
      title: 'Brush/Accent Color',
      type: 'string',
      description:
        'Color for brush strokes and accents (e.g., #FFB6C1). Leave empty to use auto-generated color.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true // Optional field
          // Validate hex color format
          if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
            return 'Must be a valid hex color (e.g., #FFB6C1)'
          }
          return true
        }),
    }),
    defineField({
      name: 'previewType',
      title: 'Preview Type',
      type: 'string',
      options: {
        list: [
          {title: 'Cover Image', value: 'image'},
          {title: 'Text Extract', value: 'text'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) =>
        !(
          parent?.projectKind === 'personal' &&
          parent?.projectSize === 'small' &&
          parent?.projectSubtype === 'writing'
        ),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {
            projectKind?: string
            projectSize?: string
            projectSubtype?: string
          }
          if (
            parent?.projectKind === 'personal' &&
            parent?.projectSize === 'small' &&
            parent?.projectSubtype === 'writing' &&
            !value
          ) {
            return 'Preview type is required for writing projects'
          }
          return true
        }),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Important for SEO and accessibility.',
        }),
      ],
      hidden: ({parent}) =>
        parent?.projectKind === 'personal' &&
        parent?.projectSize === 'small' &&
        parent?.projectSubtype === 'writing' &&
        parent?.previewType === 'text',
      description: 'For small personal artwork: This will be the first image in the carousel',

      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {
            projectKind?: string
            projectSize?: string
            projectSubtype?: string
            previewType?: string
          }

          // For writing projects using text extract, cover image is optional
          if (
            parent?.projectKind === 'personal' &&
            parent?.projectSize === 'small' &&
            parent?.projectSubtype === 'writing' &&
            parent?.previewType === 'text'
          ) {
            return true
          }

          // Cover image required for writing projects using image preview
          if (
            parent?.projectKind === 'personal' &&
            parent?.projectSize === 'small' &&
            parent?.projectSubtype === 'writing' &&
            parent?.previewType === 'image' &&
            !value
          ) {
            return 'Cover image is required when using image preview'
          }

          // Cover image required for professional projects and large personal projects
          if (
            parent?.projectKind === 'professional' ||
            (parent?.projectKind === 'personal' && parent?.projectSize === 'large')
          ) {
            if (!value) {
              return 'Cover image is required'
            }
          }

          if (
            parent?.projectKind === 'personal' &&
            parent?.projectSize === 'small' &&
            parent?.projectSubtype === 'artwork' &&
            !value
          ) {
            return 'Cover image is required (this will be the first image in your carousel)'
          }

          // Cover image optional for small personal artwork projects
          return true
        }),
    }),
    defineField({
      name: 'textExtractIndex',
      title: 'Text Extract (Block Number)',
      type: 'number',
      description: 'Which text block to use as preview (1 = first block, 2 = second block, etc.)',
      hidden: ({parent}) =>
        !(
          parent?.projectKind === 'personal' &&
          parent?.projectSize === 'small' &&
          parent?.projectSubtype === 'writing' &&
          parent?.previewType === 'text'
        ),
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const parent = context.document as {
              projectKind?: string
              projectSize?: string
              projectSubtype?: string
              previewType?: string
            }
            if (
              parent?.projectKind === 'personal' &&
              parent?.projectSize === 'small' &&
              parent?.projectSubtype === 'writing' &&
              parent?.previewType === 'text' &&
              !value
            ) {
              return 'Text extract block number is required when using text preview'
            }
            return true
          })
          .min(1),
    }),
    // Images for Small Personal Artwork Projects
    defineField({
      name: 'images',
      title: 'Additional images (and videos)',
      type: 'array',
      description:
        'Add more images or videos to the carousel (your cover image will be shown first)',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'title',
              title: 'Image Title (Optional)',
              type: 'string',
              description: 'Optional title for this specific image',
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        },
        {
          type: 'object',
          name: 'videoItem',
          title: 'Video',
          fields: [
            {
              name: 'video',
              title: 'Video File',
              type: 'file',
              options: {
                accept: 'video/*',
              },
            },
            {
              name: 'title',
              title: 'Video Title (Optional)',
              type: 'string',
              description: 'Optional title for this video',
            },
            {
              name: 'poster',
              title: 'Poster Image (Optional)',
              type: 'image',
              description: 'Thumbnail shown before video plays',
              options: {
                hotspot: true,
              },
            },
          ],
          preview: {
            select: {
              title: 'title',
              media: 'poster',
            },
            prepare({title, media}) {
              return {
                title: title || 'Video',
                subtitle: 'Video',
                media,
              }
            },
          },
        },
      ],
      hidden: ({parent}) =>
        !(
          parent?.projectKind === 'personal' &&
          parent?.projectSize === 'small' &&
          parent?.projectSubtype === 'artwork'
        ),
    }),

    defineField({
      name: 'writingLayout',
      title: 'Writing Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Single Page (One column)', value: 'single'},
          {title: 'Double Page Spread (Two columns, like a book)', value: 'double'},
        ],
        layout: 'radio',
      },
      initialValue: 'single',
      description: 'Choose how to display your writing content',
      hidden: ({parent}) =>
        !(
          parent?.projectKind === 'personal' &&
          parent?.projectSize === 'small' &&
          parent?.projectSubtype === 'writing'
        ),
    }),

    // Writing Content (Simple text blocks + images)
    defineField({
      name: 'writingContent',
      title: 'Writing Content',
      type: 'array',
      description: 'Your writing with optional images. Each text block should fit on one page.',
      of: [
        {
          type: 'object',
          name: 'writingTextBlock',
          title: 'Text Block',
          fields: [
            {
              name: 'content',
              title: 'Text Content',
              type: 'text',
              rows: 10,
              validation: (rule) =>
                rule.max(1000).error('Keep text blocks under 1000 characters (about 10 lines)'),
            },
          ],
          preview: {
            select: {
              content: 'content',
            },
            prepare({content}) {
              return {
                title: content ? content.substring(0, 50) + '...' : 'Text Block',
                subtitle: 'Text',
              }
            },
          },
        },
        {
          type: 'object',
          name: 'writingImageBlock',
          title: 'Image',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                },
              ],
            },
            {
              name: 'caption',
              title: 'Caption (optional)',
              type: 'string',
            },
          ],
          preview: {
            select: {
              media: 'image',
              caption: 'caption',
            },
            prepare({media, caption}) {
              return {
                title: caption || 'Image',
                subtitle: 'Image',
                media,
              }
            },
          },
        },
      ],
      hidden: ({parent}) =>
        !(
          parent?.projectKind === 'personal' &&
          parent?.projectSize === 'small' &&
          parent?.projectSubtype === 'writing'
        ),
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
      hidden: ({parent}) => parent?.projectKind === 'personal' && parent?.projectSize === 'small',
    }),
    defineField({
      name: 'categorySections',
      title: 'Category Sections',
      type: 'array',
      description: 'Content organized by categories',
      of: [{type: 'categorySection'}],
      hidden: ({parent}) =>
        parent?.projectKind !== 'professional' &&
        !(parent?.projectKind === 'personal' && parent?.projectSize === 'large'),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.document as {projectKind?: string; projectSize?: string}

          // Required for professional projects
          if (parent?.projectKind === 'professional') {
            if (!value || value.length === 0) {
              return 'Category Sections are required for professional projects'
            }
          }

          return true
        }),
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
                    name: 'linkType',
                    type: 'string',
                    title: 'Link Type',
                    options: {
                      list: [
                        {title: 'Internal Page', value: 'internal'},
                        {title: 'External URL', value: 'external'},
                      ],
                      layout: 'radio',
                    },
                    initialValue: 'internal',
                  },
                  {
                    name: 'internalLink',
                    type: 'string',
                    title: 'Internal Page',
                    description: 'e.g., /works, /productions, /about',
                    hidden: ({parent}) => parent?.linkType !== 'internal',
                  },
                  {
                    name: 'href',
                    type: 'url',
                    title: 'External URL',
                    hidden: ({parent}) => parent?.linkType !== 'external',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
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
                    name: 'linkType',
                    type: 'string',
                    title: 'Link Type',
                    options: {
                      list: [
                        {title: 'Internal Page', value: 'internal'},
                        {title: 'External URL', value: 'external'},
                      ],
                      layout: 'radio',
                    },
                    initialValue: 'internal',
                  },
                  {
                    name: 'internalLink',
                    type: 'string',
                    title: 'Internal Page',
                    description: 'e.g., /works, /productions, /about',
                    hidden: ({parent}) => parent?.linkType !== 'internal',
                  },
                  {
                    name: 'href',
                    type: 'url',
                    title: 'External URL',
                    hidden: ({parent}) => parent?.linkType !== 'external',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
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
                    name: 'linkType',
                    type: 'string',
                    title: 'Link Type',
                    options: {
                      list: [
                        {title: 'Internal Page', value: 'internal'},
                        {title: 'External URL', value: 'external'},
                      ],
                      layout: 'radio',
                    },
                    initialValue: 'internal',
                  },
                  {
                    name: 'internalLink',
                    type: 'string',
                    title: 'Internal Page',
                    description: 'e.g., /works, /productions, /about',
                    hidden: ({parent}) => parent?.linkType !== 'internal',
                  },
                  {
                    name: 'href',
                    type: 'url',
                    title: 'External URL',
                    hidden: ({parent}) => parent?.linkType !== 'external',
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
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
      projectKind: 'projectKind',
      projectSize: 'projectSize',
      projectSubtype: 'projectSubtype',
    },
    prepare({title, media, date, projectKind, projectSize, projectSubtype}) {
      const subtitleParts = [
        projectKind === 'professional'
          ? 'Professional'
          : projectSize === 'small'
            ? `Personal (${projectSubtype === 'writing' ? 'Writing' : 'Artwork'})`
            : 'Personal (Large)',
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
