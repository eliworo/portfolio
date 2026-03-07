/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'
import StudioLogo from './components/StudioLogo'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'post':
      return slug ? `/posts/${slug}` : undefined
    case 'page':
      return slug ? `/${slug}` : undefined
    case 'project':
      return slug ? `/productions/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Elisabeth Woronoff',
  icon: StudioLogo,

  projectId,
  dataset,

  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      // The global "+" button
      if (creationContext.type === 'global') {
        // Only allow creating "project"
        return prev.filter((template) => template.templateId === 'project')
      }

      // For everything inside the desk structure, keep defaults
      return prev
    },
  },

  plugins: [
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/presentation-resolver-api#57720a5678d9
        mainDocuments: defineDocuments([
          {
            route: '/',
            filter: `_type == "homepage" && _id == "homepageContent"`,
          },
          {
            route: '/works',
            filter: `_type == "works" && _id == "worksPage"`,
          },
          {
            route: '/productions',
            filter: `_type == "productions" && _id == "productionsPage"`,
          },
          {
            route: '/productions/:slug',
            filter: `_type == "project" && slug.current == $slug && projectKind == "professional"`,
          },
          {
            route: '/studio-works',
            filter: `_type == "studioWorks" && _id == "studioWorksPage"`,
          },
          {
            route: '/studio-works/:slug',
            filter: `_type == "project" && slug.current == $slug`,
          },
          {
            route: '/commissions',
            filter: `_type == "commissions" && _id == "commissionsPage"`,
          },
          {
            route: '/about',
            filter: `_type == "about" && _id == "aboutPage"`,
          },
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug || _id == $slug`,
          },
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
        ]),
        // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/presentation-resolver-api#8d8bca7bfcd7
        locations: {
          homepage: defineLocations({
            locations: [homeLocation],
            message: 'This is the homepage',
            tone: 'positive',
          }),
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'positive',
          }),
          works: defineLocations({
            select: {
              title: 'title',
            },
            resolve: (_doc) => ({
              locations: [
                {
                  title: 'Works',
                  href: '/works',
                },
              ],
            }),
          }),
          productions: defineLocations({
            select: {
              title: 'title',
            },
            resolve: (_doc) => ({
              locations: [
                {
                  title: 'Productions',
                  href: '/productions',
                },
              ],
            }),
          }),
          studioWorks: defineLocations({
            select: {
              title: 'title',
            },
            resolve: (_doc) => ({
              locations: [
                {
                  title: 'Studio Works',
                  href: '/studio-works',
                },
              ],
            }),
          }),
          commissions: defineLocations({
            select: {
              title: 'title',
            },
            resolve: (_doc) => ({
              locations: [
                {
                  title: 'Commissions',
                  href: '/commissions',
                },
              ],
            }),
          }),
          about: defineLocations({
            select: {
              title: 'title',
            },
            resolve: (_doc) => ({
              locations: [
                {
                  title: 'About',
                  href: '/about',
                },
              ],
            }),
          }),
          project: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              projectKind: 'projectKind',
              projectSize: 'projectSize',
              visible: 'visible',
            },
            resolve: (doc) => {
              if (!doc?.visible) {
                return {locations: []}
              }

              const locations: DocumentLocation[] = []

              // Professional projects appear on productions page
              if (doc.projectKind === 'professional') {
                locations.push({
                  title: 'Productions (List)',
                  href: '/productions',
                })
                if (doc.slug) {
                  locations.push({
                    title: doc.title || 'Untitled',
                    href: `/productions/${doc.slug}`,
                  })
                }
              }

              // Personal projects always appear in studio-works list.
              if (doc.projectKind === 'personal') {
                locations.push({
                  title: 'Studio Works (List)',
                  href: '/studio-works',
                })

                // Only large personal projects have a dedicated detail page.
                if (doc.projectSize === 'large' && doc.slug) {
                  locations.push({
                    title: doc.title || 'Untitled',
                    href: `/studio-works/${doc.slug}`,
                  })
                }
              }

              return {
                locations,
              }
            },
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug)!,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug)!,
                },
                {
                  title: 'Home',
                  href: '/',
                } satisfies DocumentLocation,
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
        },
      },
    }),
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Additional plugins for enhanced functionality
    unsplashImageAsset(),
    assist(),
    visionTool(),
  ],

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
  },
})
