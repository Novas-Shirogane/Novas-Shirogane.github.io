import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { marked } from 'marked'

// content配下のmdを全部読み込む（raw文字列として）
const mdModules = import.meta.glob('../content/**/*.md', { as: 'raw', eager: true }) as Record<string, string>

type Post = {
  slug: string        // 2026/03/2026-03-01
  path: string        // /posts/2026/03/2026-03-01
  title: string
  dateKey: string
  body: string
}

function guessTitle(md: string) {
  const m = md.match(/^#\s+(.+)$/m)
  return m?.[1]?.trim() ?? 'Untitled'
}

const posts: Post[] = Object.entries(mdModules).map(([filePath, body]) => {
  const slug = filePath.replace('../content/', '').replace(/\.md$/, '')
  const dateKey = slug.split('/').at(-1) ?? slug
  return {
    slug,
    path: `/posts/${slug}`,
    title: guessTitle(body),
    dateKey,
    body,
  }
}).sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))

function Home() {
  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 16px' }}>
      <h1>週報</h1>
      <p>content/xxxx/yy/zz.md を追加すると一覧に増える。</p>
      <ul>
        {posts.map(p => (
          <li key={p.path}>
            <Link to={p.path}>{p.dateKey} - {p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PostPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const post = posts.find(p => p.slug === slug)
  if (!post) return <div style={{ padding: 16 }}>Not found</div>

  const html = marked.parse(post.body)

  return (
    <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 16px' }}>
      <p><Link to="/">← 一覧へ</Link></p>
      <h1>{post.title}</h1>
      <p style={{ opacity: 0.7 }}>{post.dateKey}</p>
      <article dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/*" element={<PostPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)