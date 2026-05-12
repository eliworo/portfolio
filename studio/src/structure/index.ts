import {
  CogIcon,
  CaseIcon,
  TagIcon,
  UserIcon,
  DocumentIcon,
  FolderIcon,
  HomeIcon,
  StackCompactIcon,
} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// const DISABLED_TYPES = ['settings', 'assist.instruction.context']

export const structure: StructureResolver = (S: StructureBuilder, context) =>
  S.list()
    .title('Portfolio')
    .items([
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homepage').documentId('homepageContent')),
      // S.listItem()
      //   .title('Navigation')
      //   .icon(MenuIcon)
      //   .child(S.document().schemaType('navigation').documentId('mainNavigation')),
      S.divider(),

      S.listItem()
        .title('Works')
        .icon(CaseIcon)
        .child(
          S.list()
            .title('Works')
            .items([
              S.listItem()
                .title('Projects')
                .icon(FolderIcon)
                .child(
                  S.list()
                    .title('Projects')
                    .items([
                      // All Projects option
                      // S.listItem()
                      //   .title('All Projects')
                      //   .icon(FolderIcon)
                      //   .child(
                      //     S.documentTypeList('project')
                      //       .title('All Projects')
                      //       .filter('_type == "project"'),
                      //   ),

                      orderableDocumentListDeskItem({
                        type: 'project',
                        title: 'All Projects',
                        icon: FolderIcon,
                        S,
                        context,
                      }),

                      S.listItem()
                        .title('Browse by Project Type')
                        .icon(CaseIcon)
                        .child(
                          S.list()
                            .title('Browse by Project Type')
                            .items([
                              S.listItem()
                                .title('Professional')
                                .child(
                                  S.documentList()
                                    .title('Professional Projects')
                                    .filter(
                                      '_type == "project" && projectKind == "professional"',
                                    ),
                                ),
                              S.listItem()
                                .title('Personal')
                                .child(
                                  S.documentList()
                                    .title('Personal Projects')
                                    .filter('_type == "project" && projectKind == "personal"'),
                                ),
                            ]),
                        ),

                      S.listItem()
                        .title('Browse by Category')
                        .icon(TagIcon)
                        .child(
                          S.documentTypeList('category')
                            .title('Browse by Category')
                            .child((categoryId) =>
                              S.documentList()
                                .title('Projects in this category')
                                .filter('_type == "project" && references($categoryId)')
                                .params({categoryId}),
                            ),
                        ),
                    ]),
                ),

              S.divider(),

              S.listItem()
                .title('Productions')
                .icon(CaseIcon)
                .child(S.document().schemaType('productions').documentId('productionsPage')),

              S.listItem()
                .title('Studio Works')
                .icon(StackCompactIcon)
                .child(
                  S.document()
                    .schemaType('studioWorks')
                    .documentId('studioWorksPage')
                    .title('Studio Works'),
                ),

              // Studio Works - using existing ID
              // S.listItem()
              //   .title('Studio')
              //   .icon(StackCompactIcon)
              //   .child(
              //     S.document()
              //       .schemaType('projectType')
              //       .documentId('1e97637b-d4fc-491e-8dc4-0e0205242ab5')
              //       .title('Studio Works'),
              //   ),

              S.divider(),

              // orderableDocumentListDeskItem({
              //   type: 'projectType',
              //   title: 'Groups',
              //   icon: StackCompactIcon,
              //   S,
              //   context,
              // }),

              S.listItem()
                .title('Categories')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('category').title('Categories').filter('_type == "category"'),
                ),
              S.divider(),
              S.listItem()
                .title('Settings')
                .icon(CogIcon)
                .child(S.document().schemaType('works').documentId('worksPage')),
            ]),
        ),
      S.listItem()
        .title('Commissions')
        .icon(DocumentIcon)
        .child(S.document().schemaType('commissions').documentId('commissionsPage')),

      S.listItem()
        .title('About')
        .icon(UserIcon)
        .child(S.document().schemaType('about').documentId('aboutPage')),

      S.divider(),

      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('siteSettings')),

      // --- ✨ Fallback: show all other docs not filtered above ---
      // ...S.documentTypeListItems()
      //   .filter((listItem) => !DISABLED_TYPES.includes(listItem.getId()))
      //   .filter((listItem) => !['project', 'projectType', 'category'].includes(listItem.getId()))
      //   .map((listItem) => listItem.title(pluralize(listItem.getTitle() as string))),
    ])
