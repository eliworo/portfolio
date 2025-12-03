import {useEffect} from 'react'
import {set, PatchEvent, type Reference, type ObjectInputProps, useClient} from 'sanity'

type CategoryFieldValue = Reference | undefined

export default function CategorySync(props: ObjectInputProps) {
  const client = useClient({apiVersion: '2023-10-01'})

  const ref = (props.value as CategoryFieldValue)?._ref

  useEffect(() => {
    if (!ref) return

    client
      .fetch<{title?: string}>(`*[_type == "category" && _id == $id][0]{title}`, {id: ref})
      .then((cat) => {
        if (!cat?.title) return

        const patch = PatchEvent.from(set(cat.title, ['categoryTitle']))
        props.onChange(patch)
      })
      .catch((err) => console.error('Failed to sync category title:', err))
  }, [ref])

  return props.renderDefault(props)
}
