import {defineField, defineType} from 'sanity'
import {HomeIcon, PlayIcon, ImageIcon, LinkIcon, CalendarIcon} from '@sanity/icons'

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
      title: 'Hero Image / Video Fallback',
      type: 'image',
      description: 'Used as main image OR as poster/fallback for videos while loading',
      options: {hotspot: true},
    }),
    defineField({
      name: 'heroVideoMobile',
      title: 'Hero Video (Mobile)',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      hidden: ({parent}) => parent?.heroType !== 'video',
    }),
    defineField({
      name: 'heroVideoDesktop',
      title: 'Hero Video (Desktop)',
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
    defineField({
      name: 'muteIcon',
      title: 'Mute Icon',
      type: 'image',
      description: 'Custom icon for mute button',
      options: {hotspot: true},
    }),
    defineField({
      name: 'unmuteIcon',
      title: 'Unmute Icon (optional)',
      type: 'image',
      description: 'Custom icon for unmute state. If not provided, mute icon will be used.',
      options: {hotspot: true},
    }),

    defineField({
      name: 'newsPostIts',
      title: 'News Post-its',
      type: 'array',
      description: 'Add up to 4 news items to display as post-it notes on the homepage.',
      validation: (Rule) => Rule.max(4),
      of: [
        {
          type: 'object',
          icon: CalendarIcon,
          fields: [
            defineField({
              name: 'postItImage',
              title: 'Post-it Background Image',
              type: 'image',
              description:
                'Upload a custom image for the note background. If left empty, the standard white box style will be used.',
              options: {hotspot: true},
            }),
            defineField({
              name: 'titleImage',
              title: 'Title Image',
              type: 'image',
              description: 'Image to replace the text title (e.g. handwritten "NEWS").',
              options: {hotspot: true},
            }),
            defineField({
              name: 'title',
              title: 'Title Text',
              type: 'string',
              initialValue: 'NEWS',
              description: 'Fallback text if no title image is provided.',
            }),
            defineField({
              name: 'date',
              title: 'Date',
              type: 'string',
              description: 'e.g. "11 Octobre 2025"',
            }),
            defineField({
              name: 'description',
              title: 'Description / Location',
              type: 'text',
              rows: 2,
              description: 'Short text, e.g. "MAD Brussels"',
            }),
            defineField({
              name: 'linkUrl',
              title: 'Link URL',
              type: 'url',
            }),
            defineField({
              name: 'linkText',
              title: 'Link Text',
              type: 'string',
              description: 'e.g. "TICKETS" or "MORE INFO"',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'postItImage',
            },
            prepare(selection) {
              return {
                title: selection.title || 'News Item',
                media: selection.media || CalendarIcon,
              }
            },
          },
        },
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
