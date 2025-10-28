import {defineField, defineType} from 'sanity'
import {HomeIcon, PlayIcon, ImageIcon, LinkIcon} from '@sanity/icons'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'heroType',
      title: 'Hero Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video (Upload)', value: 'video'},
          {title: 'Video (Vimeo Link)', value: 'vimeo'},
          {title: 'Video (YouTube Link)', value: 'youtube'},
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.heroType !== 'image',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Video (Upload)',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) => parent?.heroType !== 'video',
    }),
    defineField({
      name: 'vimeoUrl',
      title: 'Vimeo URL',
      type: 'url',
      description: 'Full Vimeo URL (e.g., https://vimeo.com/1065420917)',
      hidden: ({parent}) => parent?.heroType !== 'vimeo',
      validation: (rule) =>
        rule.custom((value, context: any) => {
          if (context.parent?.heroType === 'vimeo' && !value) {
            return 'Vimeo URL is required when hero type is Vimeo'
          }
          if (value && !value.includes('vimeo.com')) {
            return 'Please enter a valid Vimeo URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Full YouTube URL (e.g., https://www.youtube.com/watch?v=...)',
      hidden: ({parent}) => parent?.heroType !== 'youtube',
      validation: (rule) =>
        rule.custom((value, context: any) => {
          if (context.parent?.heroType === 'youtube' && !value) {
            return 'YouTube URL is required when hero type is YouTube'
          }
          if (value && !value.includes('youtube.com') && !value.includes('youtu.be')) {
            return 'Please enter a valid YouTube URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoSettings',
      title: 'Video Settings',
      type: 'object',
      hidden: ({parent}) => !['video', 'vimeo', 'youtube'].includes(parent?.heroType),
      fields: [
        defineField({
          name: 'autoplay',
          title: 'Autoplay',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'muted',
          title: 'Muted',
          type: 'boolean',
          initialValue: true,
          description: 'Recommended for autoplay to work on most browsers',
        }),
        defineField({
          name: 'loop',
          title: 'Loop',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'controls',
          title: 'Show Controls',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'logo',
      heroType: 'heroType',
    },
    prepare(selection) {
      return {
        title: 'Homepage',
        subtitle: selection.heroType ? `Hero: ${selection.heroType}` : undefined,
        media: selection.media,
      }
    },
  },
})
