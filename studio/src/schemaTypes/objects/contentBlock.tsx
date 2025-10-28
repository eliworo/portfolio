import {defineType, defineField} from 'sanity'
import {ImageIcon, ImagesIcon, DocumentTextIcon, ComposeIcon, PlayIcon} from '@sanity/icons'

// Rich text block with column options
export const textBlock = defineType({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
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
        // Inline image support within text
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Column Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Full Width', value: 'full'},
          {title: 'Two Columns', value: 'two'},
          {title: 'Three Columns', value: 'three'},
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
    defineField({
      name: 'alignment',
      title: 'Text Alignment',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Center', value: 'center'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      columns: 'columns',
    },
    prepare({content, columns}) {
      const block = content?.find((block: any) => block._type === 'block')
      const text = block?.children?.[0]?.text || 'Empty text block'

      return {
        title: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
        subtitle: `${columns === 'two' ? '2' : columns === 'three' ? '3' : '1'} Column Text`,
        media: DocumentTextIcon,
      }
    },
  },
})

// Single image with layout options
export const imageBlock = defineType({
  name: 'imageBlock',
  title: 'Image Block',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      validation: (Rule) => Rule.max(3),
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'material',
              type: 'string',
              title: 'Material',
            },
            {
              name: 'dimensions',
              type: 'string',
              title: 'Dimensions',
            },
            {
              name: 'year',
              type: 'string',
              title: 'Year',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'layout',
      title: 'Image Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Single - Full Width', value: 'single-full'},
          {title: 'Single - Large', value: 'single-large'},
          {title: 'Single - Medium', value: 'single-medium'},
          {title: 'Two Side by Side', value: 'two-row'},
          {title: 'Three Side by Side', value: 'three-row'},
        ],
        layout: 'radio',
      },
      initialValue: 'single-large',
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Center', value: 'center'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'center',
      hidden: ({parent}) =>
        parent?.layout?.startsWith('two') || parent?.layout?.startsWith('three'),
    }),
    defineField({
      name: 'spacing',
      title: 'Spacing',
      type: 'string',
      options: {
        list: [
          {title: 'Compact', value: 'compact'},
          {title: 'Normal', value: 'normal'},
          {title: 'Spacious', value: 'spacious'},
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    }),
  ],
  preview: {
    select: {
      images: 'images',
      firstImage: 'images.0.asset',
      layout: 'layout',
    },
    prepare(selection) {
      const {images, firstImage, layout} = selection
      // compute count gracefully
      let imageCount = 0
      if (Array.isArray(images)) {
        imageCount = images.length
      } else if (images && typeof images === 'object') {
        // fallback: sometimes arrays come in object-like shape
        imageCount = Object.keys(images).length
      }
      const title = `${imageCount} Image${imageCount === 1 ? '' : 's'}`
      const subtitle = layout?.replace(/[-_]/g, ' ') || 'Image Block'
      return {
        title,
        subtitle,
        media: firstImage || ImageIcon,
      }
    },
  },
})

// Image carousel/gallery
export const imageGallery = defineType({
  name: 'imageGallery',
  title: 'Image Gallery / Carousel',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'material',
              type: 'string',
              title: 'Material',
            },
            {
              name: 'dimensions',
              type: 'string',
              title: 'Dimensions',
            },
            {
              name: 'year',
              type: 'string',
              title: 'Year',
            },
            {
              name: 'category',
              type: 'reference',
              to: [{type: 'category'}],
              title: 'Category',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(2),
    }),
    defineField({
      name: 'displayStyle',
      title: 'Display Style',
      type: 'string',
      options: {
        list: [
          {title: 'Carousel / Slideshow', value: 'carousel'},
          {title: 'Grid', value: 'grid'},
          // {title: 'Masonry', value: 'masonry'},
        ],
        layout: 'radio',
      },
      initialValue: 'carousel',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Image Aspect Ratio',
      type: 'string',
      options: {
        list: [
          {title: 'Original', value: 'original'},
          {title: 'Square (1:1)', value: 'square'},
          {title: 'Landscape (16:9)', value: 'landscape'},
          {title: 'Portrait (3:4)', value: 'portrait'},
        ],
      },
      initialValue: 'original',
      hidden: ({parent}) => parent?.displayStyle === 'masonry',
    }),
  ],
  preview: {
    select: {
      images: 'images',
      displayStyle: 'displayStyle',
    },
    prepare({images, displayStyle}) {
      return {
        title: `Gallery: ${images?.length || 0} images`,
        subtitle:
          displayStyle === 'carousel' ? 'Carousel' : displayStyle === 'grid' ? 'Grid' : 'Masonry',
        media: images?.[0] || ImagesIcon,
      }
    },
  },
})

// Text combined with image
export const textWithImage = defineType({
  name: 'textWithImage',
  title: 'Text with Image',
  type: 'object',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Text',
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
        },
      ],
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'imageSize',
      title: 'Image Size',
      type: 'string',
      options: {
        list: [
          {title: 'Small (1/3)', value: 'small'},
          {title: 'Medium (1/2)', value: 'medium'},
          {title: 'Large (2/3)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: {
      image: 'image',
      text: 'text',
      position: 'imagePosition',
    },
    prepare({image, text, position}) {
      const block = text?.find((block: any) => block._type === 'block')
      const textContent = block?.children?.[0]?.text || 'No text'

      return {
        title: textContent.substring(0, 60),
        subtitle: `Image on ${position}`,
        media: image,
      }
    },
  },
})

// Video embed
export const videoBlock = defineType({
  name: 'videoBlock',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, or direct video URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          {title: '16:9 (Standard)', value: '16:9'},
          {title: '4:3 (Classic)', value: '4:3'},
          {title: '1:1 (Square)', value: '1:1'},
          {title: '9:16 (Vertical)', value: '9:16'},
        ],
      },
      initialValue: '16:9',
    }),
  ],
  preview: {
    select: {
      url: 'url',
      caption: 'caption',
    },
    prepare({url, caption}) {
      return {
        title: caption || 'Video',
        subtitle: url,
        media: PlayIcon,
      }
    },
  },
})
