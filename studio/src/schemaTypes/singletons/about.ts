import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const about = defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Logo to display on the about page header',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'titleImage',
      title: 'About Title Image',
      type: 'image',
      description: 'Handwritten/painted "ABOUT" title for the page header',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'contactImage',
      title: 'Contact Image',
      type: 'image',
      description: 'Contact image to display on the about page',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'array',
      description: 'Rich text quote shown before the biography.',
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
      name: 'bioTop',
      title: 'Biography (Top)',
      description: 'First biography section, shown alongside the profile image.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
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
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'bioBottom',
      title: 'Biography (Bottom)',
      description: 'Second biography section, shown under the profile image.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
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
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility.',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'cv',
      title: 'CV',
      type: 'file',
      description: 'Upload your CV as a PDF',
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
        {
          name: 'credit',
          type: 'string',
          title: 'Credit',
          description: 'Photo credit or source information.',
        },
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'email',
          title: 'Email',
          type: 'string',
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        },
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        },
      ],
    }),
    defineField({
      name: 'arteosLogo',
      title: 'Arteos Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'arteosDescription',
      title: 'Arteos Description',
      type: 'text',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About Page',
      }
    },
  },
})
