import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import {project} from './documents/project'
import {projectType} from './documents/projectType'
import {category} from './documents/category'
import {homepage} from './singletons/homepage'
import {works} from './singletons/works'
import {navigation} from './singletons/navigation'
import {commissions} from './singletons/commissions'
import {about} from './singletons/about'
import {
  imageBlock,
  imageGallery,
  textBlock,
  textWithImage,
  videoBlock,
} from './objects/contentBlock'
import {categorySection} from './objects/categorySection'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  homepage,
  works,
  navigation,
  commissions,
  about,
  // Documents
  page,
  post,
  person,
  project,
  projectType,
  category,
  // Objects
  blockContent,
  infoSection,
  callToAction,
  link,
  categorySection,
  // Content Blocks
  textBlock,
  imageBlock,
  imageGallery,
  textWithImage,
  videoBlock,
]
