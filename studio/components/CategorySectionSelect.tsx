import React from 'react'
import {useClient, useFormValue, set, unset} from 'sanity'

type Props = {
  value?: string
  onChange: (patch: any) => void
  path: (string | number)[]
  elementProps?: React.SelectHTMLAttributes<HTMLSelectElement>
}

export default function CategorySectionSelect({value, onChange, path, elementProps}: Props) {
  const baseClient = useClient({apiVersion: '2023-10-01'})
  const client = React.useMemo(
    () => baseClient.withConfig({perspective: 'previewDrafts'}),
    [baseClient],
  )

  // sibling "project" path inside featured item
  const projectPath = React.useMemo(() => {
    const p = [...path]
    p[p.length - 1] = 'project'
    return p
  }, [path])

  const projectRefValue = useFormValue(projectPath) as {_ref?: string} | undefined
  const projectId = projectRefValue?._ref

  const [loading, setLoading] = React.useState(false)
  const [projectKind, setProjectKind] = React.useState<'professional' | 'personal' | null>(null)
  const [sections, setSections] = React.useState<{title: string; key: string}[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) {
        setProjectKind(null)
        setSections([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const data = await client.fetch(
          `*[_type == "project" && _id in [$id, "drafts." + $id]] | order(_id desc)[0]{
            projectKind,
            categorySections[]{
              _key,
              category->{title}
            }
          }`,
          {id: projectId},
        )
        if (cancelled) return
        setProjectKind(data?.projectKind ?? null)
        if (data?.projectKind === 'professional') {
          const list =
            data?.categorySections?.filter(Boolean)?.map((s: any) => ({
              title: s?.category?.title || 'Untitled section',
              key: s?._key,
            })) || []
          setSections(list)
        } else {
          setSections([])
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Fetch failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [client, projectId])

  if (!projectId) return <InfoBox text="Select a project first." />
  if (loading) return <InfoBox text="Loading sections…" />
  if (error) return <InfoBox tone="warn" text={error} />
  if (projectKind !== 'professional') {
    return <InfoBox text="Personal project selected — leave empty to feature whole project." />
  }
  if (sections.length === 0) {
    return <InfoBox tone="warn" text="This professional project has no category sections yet." />
  }

  return (
    <div>
      <label style={{display: 'block', marginBottom: 6, fontWeight: 600}}>Category section</label>
      <select
        {...elementProps}
        value={value || ''}
        onChange={(e) => {
          const v = e.target.value
          onChange(v ? set(v) : unset())
        }}
        style={{width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ddd'}}
      >
        <option value="">-- Select a section --</option>
        {sections.map((s) => (
          <option key={s.key} value={s.key}>
            {s.title}
          </option>
        ))}
      </select>
    </div>
  )
}

function InfoBox({text, tone = 'neutral'}: {text: string; tone?: 'neutral' | 'warn'}) {
  const styles: Record<string, React.CSSProperties> = {
    neutral: {
      padding: '0.75rem',
      background: '#f5f5f5',
      borderRadius: 4,
      fontSize: 13,
      lineHeight: 1.4,
    },
    warn: {
      padding: '0.75rem',
      background: '#fff3cd',
      borderRadius: 4,
      fontSize: 13,
      lineHeight: 1.4,
      color: '#664d03',
    },
  }
  return <div style={styles[tone]}>{text}</div>
}
