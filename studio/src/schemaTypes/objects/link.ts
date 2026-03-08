import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link schema object. This link object lets the user select an internal or external link.
 * Internal links use a slug/path (without domain), and external links use a URL.
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
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
    }),
    defineField({
      name: 'internalLink',
      title: 'Internal slug',
      description: 'Examples: about, productions, posts/my-post',
      type: 'string',
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'internal' && !value) {
            return 'Internal slug is required when Link Type is Internal'
          }
          return true
        }),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (Rule) =>
        // Ensure URL is provided for external links.
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'external' && !value) {
            return 'URL is required when Link Type is External'
          }
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
