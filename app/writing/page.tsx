import type { Metadata } from 'next'
import { WritingIndex } from '@/components/WritingIndex'
import { getPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Writing',
}

export default function WritingPage() {
  return <WritingIndex posts={getPosts()} />
}
