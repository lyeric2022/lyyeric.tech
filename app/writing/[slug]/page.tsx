import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { kellyComponents } from '@/components/graphs/kelly/components'
import { getPost, getPosts } from '@/lib/posts'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Not found' }
  return { title: post.title }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const minutes = post.readingTime === 1 ? 'min' : 'mins'

  return (
    <div className="writing-page">
      <article>
        <h1>{post.title}</h1>
        <div className="article-meta">
          <p className="date">{post.date}</p>
          <span className="reading-time">
            • {post.readingTime} {minutes}
          </span>
        </div>
        <MDXRemote
          source={post.body}
          components={slug === 'bet-sizing-with-fractional-kelley' ? kellyComponents : undefined}
        />
      </article>
    </div>
  )
}
