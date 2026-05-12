import { NextResponse } from 'next/server'

import { client } from '@/sanity/lib/client'
import { projectModalQuery } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  const project = await client
    .withConfig({ useCdn: false })
    .fetch(projectModalQuery, { projectId }, { stega: false })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ project })
}
