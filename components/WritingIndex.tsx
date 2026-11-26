'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { PostKind, PostMeta } from '@/lib/posts'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string) {
  const [month, , year] = dateStr.split('.').map(Number)
  return `${months[month - 1]} 20${year}`
}

export function WritingIndex({ posts }: { posts: PostMeta[] }) {
  const router = useRouter()
  const tab: PostKind = useSearchParams().get('tab') === 'drafts' ? 'note' : 'essay'

  const setTab = (next: PostKind) => {
    router.replace(next === 'note' ? '/writing?tab=drafts' : '/writing', { scroll: false })
  }

  const list = posts.filter((post) => post.kind === tab)

  return (
    <div className="writing-page writing-page--list">
      <div className="drafts-kind-toggle" role="tablist" aria-label="Writing categories">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'essay'}
          className={`drafts-kind-toggle__btn ${tab === 'essay' ? 'is-active' : ''}`}
          onClick={() => setTab('essay')}
        >
          Essays
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'note'}
          className={`drafts-kind-toggle__btn ${tab === 'note' ? 'is-active' : ''}`}
          onClick={() => setTab('note')}
        >
          Drafts
        </button>
      </div>

      <section className="drafts-panel" role="tabpanel">
        <div className="articles-list" key={tab}>
          {list.map((post) => (
            <Link key={post.slug} href={`/writing/${post.slug}`} className="article-link">
              <div className="article-preview">
                <div className="article-title-row">
                  <p className="article-title">{post.title}</p>
                  <span className="article-date">{formatDate(post.date)}</span>
                </div>
                <span className="reading-time">{post.readingTime} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
