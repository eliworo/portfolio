export const hideFromCreate = (templateId: string) => ({
  newDocumentOptions: (prev: any, {creationContext}: any) => {
    const {type} = creationContext

    if (type === 'structure') return []
    if (type === 'global') return prev.filter((t: any) => t.templateId !== templateId)
    return prev
  },
})
