import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'
import CategorySync from '../../../components/CategorySync'

export const categorySection = defineType({
  name: 'categorySection',
  title: 'Category Section',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'The category this section relates to',
      validation: (rule) => rule.required(),
      // components: {
      //   input: CategorySync,
      // },
    }),
    // defineField({
    //   name: 'categoryTitle',
    //   title: 'Category Title',
    //   type: 'string',
    //   hidden: true,
    //   readOnly: true,
    // }),
    defineField({
      name: 'preview',
      title: 'Preview',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'mode',
          title: 'Preview Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'Text Extract', value: 'text'},
            ],
            layout: 'radio',
          },
          initialValue: 'image',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'image',
          title: 'Preview Image',
          type: 'image',
          options: {hotspot: true},
          hidden: ({parent}) => parent?.mode !== 'image',
        }),
        defineField({
          name: 'textOverride',
          title: 'Custom Text',
          type: 'text',
          rows: 3,
          description: 'Optional manual text. Leave empty to pull text from the section content.',
          hidden: ({parent}) => parent?.mode !== 'text',
        }),
        defineField({
          name: 'textExtractIndex',
          title: 'Text Block Number',
          type: 'number',
          description:
            'Select which text block (1 = first, 2 = second, etc.) from this section’s content should be used.',
          hidden: ({parent}) => parent?.mode !== 'text',
          validation: (rule) => rule.min(1),
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Section Content',
      type: 'array',
      description: 'Content blocks for this category section',
      of: [
        {type: 'textBlock'},
        {type: 'imageBlock'},
        {type: 'imageGallery'},
        {type: 'textWithImage'},
        {type: 'videoBlock'},
      ],
      // validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'category.title',
      media: 'category.icon',
    },
    prepare({title, media}) {
      return {
        title: title || 'Uncategorized Section',
        subtitle: 'Category Section',
        media: media || TagIcon,
      }
    },
  },
})
