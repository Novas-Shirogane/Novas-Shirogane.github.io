import React from 'react'
import ReactDOM from 'react-dom/client'

import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom'
import { marked } from 'marked'

import './index.css'

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">週報</h1>
          <p className="mt-2 text-sm text-zinc-400">
            content/xxxx/yy/zz.md を追加すると自動で増える
          </p>
        </header>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <ul className="divide-y divide-zinc-800">
            {posts.map(p => (
              <li key={p.path} className="p-4 hover:bg-zinc-900/60 transition">
                <Link to={p.path} className="block">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-zinc-300 text-sm">{p.dateKey}</span>
                    <span className="text-zinc-100 font-medium truncate">{p.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Novas-Shirogane
        </footer>
      </div>
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-8">
          <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← 一覧へ
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{post.dateKey}</p>
        </header>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
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