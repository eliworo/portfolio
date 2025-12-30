import { defineQuery } from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ${linkFields},
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

export const homepageQuery = `
*[_type == "homepage"][0]{
  heroType,
  heroImage{
    asset->{url}
  },
  heroVideoMobile{
    asset->{url}
  },
  heroVideoDesktop{
    asset->{url}
  },
  vimeoUrl,
  youtubeUrl,
  videoSettings{
    autoplay,
    muted,
    loop,
    controls
  },
  logo{
    asset->{url}
  },
  showLogo,
  muteIcon {
    asset->{
      url
    }
  },
  unmuteIcon {
    asset->{
      url
    }
  },
  newsPostIts[]{
    title,
    date,
    description,
    linkUrl,
    linkText,
    postItImage {
      asset->{
        url
      }
    },
    titleImage {
      asset->{
        url
      }
    }
  }
}
`

const worksFields = /* groq */ `
  _id,
  titleImage{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  description
`

const featuredProjectFields = /* groq */ `
  project->{
    _id,
    title,
    slug {
      current
    },
    titleImage {
      asset->{
        url
      }
    },
    coverImage {
      asset->{ _id, url },
      crop,
      hotspot,
      alt
    },
    projectType->{
      title,
      slug {
        current
      }
    },
    categories[]->{
      _id,
      title,
      slug{current},
      titleImage {
        asset->{
          url
        }
      }
    }
  },
  offsetY,
  offsetX,
  rotation,
  scale,
  zIndex
`

export const worksPageQuery = defineQuery(`
  *[_type == "works" && _id == "worksPage"][0]{
    ${worksFields},
    featuredProjects[]{
      ${featuredProjectFields}
    }
  }
`)

export const projectTypesQuery = defineQuery(`
  *[_type == "projectType" && visibleInNav == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`)

export const projectsByTypeQuery = defineQuery(`
  *[_type == "project" && projectType->slug.current == $typeSlug] | order(orderRank asc) {
    _id,
    title,
    slug,
    mainImage{
      asset->{
        url
      }
    },
    excerpt,
    "projectType": projectType->title
  }
`)

export const allProjectsQuery = defineQuery(`
  *[_type == "project"] | order(orderRank asc) {
    _id,
    title,
    slug,
    mainImage{
      asset->{
        url
      }
    },
    excerpt,
    "projectType": projectType->title
  }
`)

export const navigationQuery = defineQuery(`
  *[_type == "navigation"][0]{
    logoE{
      asset->{
        url,
        metadata {
          dimensions
        }
      }
    },
    mainItems[]{
      title,
      slug,
      logo{
        asset->{
          url,
          metadata {
            dimensions
          }
        }
      },
      subItems[]{
        title,
        slug,
        logo{
          asset->{
            url,
            metadata {
              dimensions
            }
          }
        }
      }
    }
  }
`)

export const navigationImagesQuery = defineQuery(`{
  "works": *[_type == "works"][0]{
    titleImage{asset->{url}}
  },
  "about": *[_type == "about"][0]{
    titleImage{asset->{url}}
  },
  "commissions": *[_type == "commissions"][0]{
    titleImage{asset->{url}}
  },
  "productions": *[_type == "productions"][0]{
    titleImage{asset->{url}}
  },
  "studioWorks": *[_type == "studioWorks"][0]{
    titleImage{asset->{url}}, // keep existing horizontal
    titleImageStudio{asset->{url}},
    titleImageWorks{asset->{url}}
  },
  "homepage": *[_type == "homepage"][0]{
    logo{asset->{url}}
  },
  "projectGroups": *[_type == "projectType" && visibleInNav == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    titleImage{asset->{url}},
    "projects": *[_type == "project" && references(^._id) && defined(visible) && visible == true] | order(orderRank asc) {
      title,
      "slug": slug.current,
      titleImage{asset->{url}}, 
      coverImage{asset->{url}, alt}
    }
  }
}`)

export const projectGroupQuery =
  defineQuery(`*[_type == "projectType" && slug.current == $slug][0]{
    _id,
    title,
    description,
    titleImage{asset->{url}},
    "featuredProjects": featuredProjects[]{
      _key,
      offsetY,
      offsetX,
      rotation,
      scale,
      zIndex,
      categorySectionKey,
      project->{
        _id,
        title,
        "slug": slug.current,
        projectKind,
        "projectTypeSlug": projectType->slug.current,
        titleImage{asset->{url}},
        coverImage{asset->{url}, alt},
        description,
        year,
        "categories": categories[]->{
          _id,
          title,
          slug{current},
          titleImage{asset->{url}}
        },
        content[]{
          _type,
          _key,
          _type == "imageBlock" => {
            _type,
            _key,
            images[]{asset->{_id, url}, alt, crop, hotspot}
          },
          _type == "imageGallery" => {
            _type,
            _key,
            images[]{asset->{_id, url}, alt}
          },
          _type == "videoBlock" => { _type, _key, url, caption, aspectRatio },
          _type == "mediaWithMedia" => {
          _type,
          _key,
          leftMedia {
            mediaType,
            url,
            caption,
            aspectRatio,
            image {
              asset-> {
                _id,
                url
              },
              crop,
              hotspot,
              alt,
              caption,
              material,
              dimensions,
              year
            }
          },
          rightMedia {
            mediaType,
            url,
            caption,
            aspectRatio,
            image {
              asset-> {
                _id,
                url
              },
              crop,
              hotspot,
              alt,
              caption,
              material,
              dimensions,
              year
            }
          },
          layout
        },
          _type == "textBlock" => { _type, _key, content, columns, alignment },
          _type == "textWithImage" => {
            _type, _key,
            image{asset->{_id, url}, alt, caption, hotspot, crop},
            text, imagePosition, imageSize, verticalAlignment
          }
        },
        "categorySections": categorySections[]{
          _key,
          category->{ _id, title, "slug": slug.current, titleImage{asset->{url}} },
          preview{
            _type,
            image{asset->{url}, alt},
            text
          },
          content[]{
            _type,
            _key,
            _type == "imageBlock" => { _type, _key, images[]{asset->{_id, url}, alt, crop, hotspot} },
            _type == "imageGallery" => { _type, _key, images[]{asset->{_id, url}, alt, crop, hotspot} }
          }
        }
      }
    },
    "projects": *[_type == "project" && references(^._id) && visible == true] | order(orderRank asc) {
      _id,
      title,
      "slug": slug.current,
      titleImage{asset->{url}},
      coverImage{asset->{url}, alt},
      "projectType": ^.title,
      "categories": categories[]->{ 
        _id, 
        title, 
        slug{current}, 
        titleImage{asset->{url}} 
      }
    }
  }`)

export const projectQuery = defineQuery(`
  *[_type == "project" && slug.current == $projectSlug][0] {
    _id,
    title,
    slug,
    year,
    description,
    projectKind,
    projectSize,
    projectSubtype,
    "projectType": projectType->title,
    "projectTypeSlug": projectType->slug.current,
    titleImage {
      asset-> {
        url
      }
    },
    coverImage {
      asset-> {
        url
      },
      alt
    },
    content[] {
      _type,
      _key,
      _type == "headingBlock" => {
        text,
        level,
        alignment
      },
      // Text Block
      _type == "textBlock" => {
        content,
        columns,
        alignment
      },
      // Image Block
      _type == "imageBlock" => {
        images[] {
          asset-> {
            _id,
            url
          },
          crop,
          hotspot,
          alt,
          caption,
          material,
          dimensions,
          year
        },
        layout,
        position,
        spacing,
        collageMode
      },
      // Image Gallery
      _type == "imageGallery" => {
        images[] {
          asset-> {
            url
          },
          alt,
          crop,
          hotspot,
          caption,
          material,
          dimensions,
          year,
          category-> {
            title
          }
        },
        displayStyle,
        aspectRatio
      },
      // Text with Image
      _type == "textWithImage" => {
        image {
          asset-> {
            _id,
            url
          },
          alt,
          caption,
          hotspot,
          crop
        },
        text,
        imagePosition,
        imageSize,
        verticalAlignment
      },
      // Video Block
      _type == "videoBlock" => {
        url,
        caption,
        aspectRatio
      },
      _type == "mediaWithMedia" => {
      _type,
      _key,
      leftMedia {
        mediaType,
        url,
        caption,
        aspectRatio,
        image {
          asset-> {
            _id,
            url
          },
          crop,
          hotspot,
          alt,
          caption,
          material,
          dimensions,
          year
        }
      },
      rightMedia {
        mediaType,
        url,
        caption,
        aspectRatio,
        image {
          asset-> {
            _id,
            url
          },
          crop,
          hotspot,
          alt,
          caption,
          material,
          dimensions,
          year
        }
      },
      layout,
      collageMode
    }
    },

    categorySections[] {
      _key,
      category-> {
        _id,
        title,
        slug,
        titleImage {
          asset-> {
            url
          }
        }
      },
      content[] {
        _type,
        _key,
          _type == "headingBlock" => {
          text,
          level,
          alignment
        },
        // Text Block
        _type == "textBlock" => {
          content,
          columns,
          alignment
        },
        // Image Block
        _type == "imageBlock" => {
          images[] {
            asset-> {
              _id,
              url
            },
            crop,
            hotspot,
            alt,
            caption,
            material,
            dimensions,
            year
          },
          layout,
          position,
          spacing,
          collageMode
        },
        // Image Gallery
        _type == "imageGallery" => {
          images[] {
            asset-> {
              url
            },
            alt,
            crop,
            hotspot,
            caption,
            material,
            dimensions,
            year,
            category-> {
              title
            }
          },
          displayStyle,
          aspectRatio
        },
        // Text with Image
        _type == "textWithImage" => {
          image {
            asset-> {
              _id,
              url
            },
            alt,
            crop,
            hotspot,
            caption
          },
          text,
          imagePosition,
          imageSize,
          verticalAlignment
        },
        // Video Block
        _type == "videoBlock" => {
          url,
          caption,
          aspectRatio
        },
        _type == "mediaWithMedia" => {
          _type,
          _key,
          leftMedia {
            mediaType,
            url,
            caption,
            aspectRatio,
            image {
              asset-> {
                _id,
                url
              },
              crop,
              hotspot,
              alt,
              caption,
              material,
              dimensions,
              year
            }
          },
          rightMedia {
            mediaType,
            url,
            caption,
            aspectRatio,
            image {
              asset-> {
                _id,
                url
              },
              crop,
              hotspot,
              alt,
              caption,
              material,
              dimensions,
              year
            }
          },
          layout,
          collageMode
        }
      }
    },
    categories[]-> {
      title,
      slug
    },
    credits,
    press,
    tournee,
    publishedAt,
    featured,
    visible
  }
`)

export const projectsListQuery = defineQuery(`
  *[_type == "project" && visible == true && projectType->slug.current == $typeSlug] | order(orderRank) {
    _id,
    title,
    slug,
    year,
    description,
    coverImage {
      asset-> {
        url
      },
      alt
    },
    "projectType": projectType->title,
    categories[]-> {
      title
    }
  }
`)

export const allProjectsByCategoryQuery = defineQuery(`{
  "categories": *[_type == "category"] {
    _id,
    title,
    "slug": slug.current,
    titleImage {
      asset-> {
        url
      }
    }
  },
  "projects": *[_type == "project" && visible != false] {
    _id,
    title,
    "slug": slug.current,
    projectKind,
    year,
    coverImage {
      asset-> {
        url
      },
      alt
    },
    titleImage {
      asset-> {
        url
      }
    },
    projectType-> {
      title,
      "slug": slug.current
    },
    // For personal projects
    categories[]-> {
      _id,
      title,
      "slug": slug.current
    },
    // For professional projects
    categorySections[] {
      category-> {
        _id,
        title,
        "slug": slug.current
      }
    }
  }
}`)

export const debugWorksQuery = defineQuery(`
  *[_type == "works"]{
    _id,
    _type,
    titleImage
  }
`)

export const categoryProjectsQuery = defineQuery(`
  *[_type == "category" && slug.current == $categorySlug][0]{
    _id,
    title,
    slug{current},
    titleImage{
      asset->{url}
    }
  } | {
    ...,
    "projects": *[_type == "project" && references(^._id) && projectType->slug.current == $groupSlug && visible == true]{
      _id,
      title,
      slug{current},
      coverImage{
        asset->{url},
        alt
      },
      titleImage{
        asset->{url}
      },
      projectType->{
        title,
        slug{current}
      },
      categories[]->{
        _id,
        title,
        slug{current},
        titleImage{
          asset->{url}
        }
      }
    },
    "allCategories": *[_type == "category" && count(*[_type == "project" && references(^._id) && projectType->slug.current == $groupSlug]) > 0]{
      _id,
      title,
      slug{current},
      titleImage{
        asset->{url}
      }
    }
  }
`)

const aboutFields = /* groq */ `
  _id,
  logo{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  titleImage{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  contactImage{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  quote,
  bio,
  cv{
    asset->{
      url
    }
  },
  profileImage{
    asset->{
      url
    },
    alt,
    credit
  },
  contact{
    email,
    instagram,
    linkedin,
    facebook
  },
  arteosDescription,
  arteosLogo{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  }
`

export const aboutPageQuery = defineQuery(`
  *[_type == "about"][0]{
    ${aboutFields}
  }
`)

// Add this near the bottom with other page queries

const commissionsFields = /* groq */ `
    _id,
  titleImage{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  quote,
  tools[]{
    titleImage{
      asset->{
        url,
        metadata {
          dimensions
        }
      }
    },
    subtitle,
    description,
    image{
      asset->{
        url
      },
      alt
    },
    offsetY,
    offsetX,
    rotation,
    scale
  }
`

export const commissionsPageQuery = defineQuery(`
  *[_type == "commissions"][0]{
    ${commissionsFields}
  }
`)

const productionsFields = /* groq */ `
  _id,
  titleImage{
    asset->{
      url,
      metadata {
        dimensions
      }
    }
  },
  description
`

const productionsFeaturedProjectFields = /* groq */ `
  project->{
    _id,
    title,
    slug {
      current
    },
    titleImage {
      asset->{
        url
      }
    },
    coverImage,
    projectKind,
    categories[]->{
      _id,
      title,
      slug{current},
      titleImage {
        asset->{
          url
        }
      }
    }
  },
  titlePosition,
  offsetY,
  offsetX,
  rotation,
  scale,
  zIndex
`

export const productionsPageQuery = defineQuery(`
  *[_type == "productions" && _id == "productionsPage"][0]{
    ${productionsFields},
    featuredProjects[]{
      ${productionsFeaturedProjectFields}
    }
  }
`)

const projectFields = /* groq */ `
  _id,
  title,
  slug { current },
  projectKind,
  projectSize,
  projectSubtype,
  titleImage { asset->{ url } },
  coverImage {
    asset->{ _id, url },
    crop,
    hotspot,
    alt
  },
 images[] {
    _type,
    _type == "image" => {
      asset->{ _id, url },
      crop,
      hotspot,
      alt,
      title
    },
    _type == "videoItem" => {
      video {
        asset->{ url }
      },
      title,
      poster {
        asset->{ url }
      }
    }
  },
  description,
  year,
  categories[]->{
    _id,
    title,
    slug{current},
    titleImage { asset->{ url } }
  },
  content,
  writingLayout,
  writingContent[] {
    _type,
    _key,
    _type == "writingTextBlock" => { content },
    _type == "writingImageBlock" => {
      image {
        asset->{ _id, url },
        crop,
        hotspot,
        alt
      },
      caption
    }
  },
  previewType,
  textExtractIndex,
  categorySections[] {
    _key,
    category->{ _id, title, slug{current}, titleImage { asset->{ url } } },
    preview {
      _type,
      mode,
      textOverride,
      textExtractIndex,
      image {
        asset->{ _id, url },
        crop,
        hotspot,
        alt
      },
      text
    },
    content[] {
      _type,
      _key,
      _type == "textBlock" => {
        content,
        columns,
        alignment
      },
      _type == "imageBlock" => {
        images[] {
          asset->{ _id, url },
          crop,
          hotspot,
          alt
        }
      },
      _type == "imageGallery" => {
        images[] {
          asset->{ _id, url },
          crop,
          hotspot,
          alt
        }
      },
      _type == "textWithImage" => {
        text,
        image {
          asset->{ _id, url },
          alt,
          caption,
          crop,
          hotspot
        },
        imagePosition,
        imageSize,
        verticalAlignment
      }
    }
  },
  credits,
  press,
  tournee,
  publishedAt,
  visible
`

export const studioWorksQuery = /* groq */ `
  *[_type == "studioWorks"][0]{
    title,
    titleImage { asset->{ url } },
    titleImageStudio { asset->{ url } },
    titleImageWorks { asset->{ url } },
    description,
    featuredProjects[] {
      _key,
      kind,
      blankLabel,
      blankSize,
      project->{
        ${projectFields}
      },
      categorySectionKey,
      offsetY,
      offsetX,
      rotation,
      scale,
      zIndex
    },
    gridSpacing { columnGap, rowGap }
  }
`
