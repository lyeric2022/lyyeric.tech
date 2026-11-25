import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type PostKind = 'essay' | 'note'

export type PostMeta = {
  slug: string
  title: string
  date: string
  kind: PostKind
  readingTime: number
}

export type Post = PostMeta & {
  body: string
}

const postsDirectory = path.join(process.cwd(), 'content/posts')

function parseDate(dateStr: string) {
  const [month, day, year] = dateStr.split('.').map(Number)
  return new Date(2000 + year, month - 1, day).getTime()
}

function readingTime(source: string) {
  const text = source
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{' '\}/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 150))
}

function readPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(postsDirectory, `${slug}.mdx`), 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    kind: data.kind === 'essay' ? 'essay' : 'note',
    readingTime: readingTime(content),
    body: content,
  }
}

export function getPosts(): PostMeta[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const { body, ...meta } = readPost(file.replace(/\.mdx$/, ''))
      void body
      return meta
    })
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
}

export function getPost(slug: string): Post | null {
  const file = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  return readPost(slug)
}
