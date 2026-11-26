import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WritingIndex } from '@/components/WritingIndex'
import { getPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Writing',
}

export default function WritingPage() {
  return (
    <Suspense>
      <WritingIndex posts={getPosts()} />
    </Suspense>
  )
}
