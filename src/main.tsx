import React from 'react'
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { HashRouter, Routes, Route, Link, useParams, Outlet, NavLink } from 'react-router-dom'
import { marked } from 'marked'

// content配下のmdを全部読み込む（raw文字列として）
const mdModules = import.meta.glob('../content/**/*.md', { as: 'raw', eager: true }) as Record<string, string>

type Post = {
  slug: string
  path: string
  title: string
  dateKey: string
  body: string
}

function guessTitle(md: string) {
  const m = md.match(/^#\s+(.+)$/m)
  return m?.[1]?.trim() ?? 'Untitled'
}

const posts: Post[] = Object.entries(mdModules)
  .filter(([path]) => {
    const filename = path.split('/').pop() ?? ''
    return !filename.startsWith('_') && filename !== 'template.md'
  })
  .map(([filePath, body]) => {
    const slug = filePath.replace('../content/', '').replace(/\.md$/, '')
    const dateKey = slug.split('/').at(-1) ?? slug
    return {
      slug,
      path: `/posts/${slug}`,
      title: guessTitle(body),
      dateKey,
      body,
    }
  })
  .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))

/** 作品データ（あとで増やすだけ） */
type WorkItem = {
  id: string
  title: string
  href: string
  updatedAt: string
  subtitle?: string
  thumbnail?: string // 例: "/thumbs/sloth.png"
}

const works: WorkItem[] = [
  {
    id: 'sloth-sprout',
    title: 'Sloth Sprout',
    href: '/works/sloth-sprout',
    updatedAt: '2026-03-02',
    subtitle: '短編パズル試作',
    thumbnail: '/vite.svg', // 仮
  },
  {
    id: 'beastilia',
    title: 'Beastilia',
    href: '/works/beastilia',
    updatedAt: '2026-03-01',
    subtitle: '世界観RPG（開発中）',
    thumbnail: '/vite.svg',
  },
]

function SegNav() {
  const base =
    'flex-1 text-center text-sm py-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition'
  const active = 'bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-zinc-100'

  return (
    <div className="mt-6">
      <div className="overflow-hidden border border-zinc-800 grid grid-cols-3 bg-[#6b5f95]">
        <NavLink to="/" end className={({ isActive }) => `${base} border-0 border-r border-zinc-800 ${isActive ? active : 'text-zinc-200'}`}>
          TOP
        </NavLink>
        <NavLink
          to="/changelog"
          className={({ isActive }) => `${base} border-0 border-r border-zinc-800  ${isActive ? active : 'text-zinc-200'}`}
        >
          更新履歴
        </NavLink>
        <NavLink
          to="/misc"
          className={({ isActive }) => `${base} border-0 ${isActive ? active : 'text-zinc-200'}`}
        >
          その他
        </NavLink>
      </div>
    </div>
  )
}

function WorksSidebar() {
  return (
    <div className="fixed left-0 top-0 h-full z-40 group">
      {/* ホバー判定（細い透明ゾーン） */}
      <div className="absolute left-0 top-0 h-full w-3" />

      {/* ここが「動く箱」：ツマミも中に入れる */}
      <div
        className={[
          'relative h-full w-80',
          'translate-x-[-19rem] group-hover:translate-x-0',
          'transition-transform duration-200 ease-out',
        ].join(' ')}
      >
        {/* ツマミ：この箱の右端に固定（箱と一緒に動く） */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
          <div className="h-24 w-4 rounded-r-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur flex items-center justify-center">
            <div className="space-y-1">
              <div className="h-1 w-1 rounded-full bg-zinc-500" />
              <div className="h-1 w-1 rounded-full bg-zinc-500" />
              <div className="h-1 w-1 rounded-full bg-zinc-500" />
            </div>
          </div>
        </div>

        {/* サイドバー本体 */}
        <aside className="h-full bg-[#6b8f3a] text-white border-r border-zinc-800 backdrop-blur pt-6 px-4">
          <div className="text-xs text-zinc-500 mb-3">作ったもの</div>

          <ul className="space-y-2">
            {works.map((w) => (
              <li key={w.id}>
                <Link
                  to={w.href}
                  className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition p-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-zinc-800/70 overflow-hidden flex items-center justify-center">
                    <img
                      src={w.thumbnail ?? '/default-thumb.png'}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="font-medium text-zinc-100 truncate">{w.title}</div>
                    <div className="mt-0.5 text-xs text-zinc-400">
                      <span className="text-zinc-500">更新: </span>
                      {w.updatedAt}
                      {w.subtitle ? <span className="text-zinc-500"> ・ </span> : null}
                      {w.subtitle ? <span className="text-zinc-400">{w.subtitle}</span> : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

function Layout() {

  const [count, setCount] = useState("000000")

  useEffect(() => {
    fetch("https://api.countapi.xyz/hit/novas-leopard/visits")
      .then(r => r.json())
      .then(data => {
        const padded = data.value.toString().padStart(6,"0")
        setCount(padded)
      })
  }, [])

  return (
    <div className="bg-[#b8b8b8] text-white min-h-screen flex flex-col">
      <WorksSidebar />

      {/* 右側の本文。サイドバーが出ても被るだけなので、レイアウトは固定でOK */}
      <div className="w-full max-w-3xl mx-auto px-6 py-14 flex-1 flex flex-col">
        <header className="bg-[#2a1a14] text-white rounded-2xl border border-zinc-800 p-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            <Link to="/" className="hover:text-zinc-200">週報</Link>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            サイドバーになんかあるけど嘘です。どこにも飛びませんm(- -)m
          </p>
          <SegNav />
        </header>

        <main className="mt-10 flex-1 w-full min-w-0">
          <Outlet />
        </main>

        <footer className="bg-[#000000] mt-12 text-xs text-white text-center">
          <div className="counter">{ count }</div>
          <p className="mt-2">
            © {new Date().getFullYear()} Novas-Leopard
          </p>
        </footer>
      </div>
    </div>
  )
}

function Home() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
      <ul className="divide-y divide-zinc-800">
        {posts.map((p) => (
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
  )
}

function PostPage() {
  const params = useParams()
  const slug = params['*'] ?? ''
  const post = posts.find((p) => p.slug === slug)
  if (!post) return <div className="text-zinc-300">Not found</div>

  const html = marked.parse(post.body)

  return (
    <div>
      <div className="mb-8">
        <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-200">← 一覧へ</Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{post.dateKey}</p>
      </header>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

function ChangelogPage() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-200">
      <div className="text-lg font-medium">更新履歴</div>
      <div className="mt-2 text-sm text-zinc-400">あとで posts や works から自動生成してもいい。</div>
    </div>
  )
}

function MiscPage() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-zinc-200">
      <div className="text-lg font-medium">その他</div>
      <div className="mt-2 text-sm text-zinc-400">未定の置き場（リンク集、プロフィールなど）。</div>
    </div>
  )
}

function WorkDetail() {
  const params = useParams()
  const id = params['id'] ?? ''
  const w = works.find((x) => x.id === id)
  if (!w) return <div className="text-zinc-300">Work not found</div>

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="text-xs text-zinc-500">作ったもの</div>
      <div className="mt-1 text-2xl font-semibold">{w.title}</div>
      <div className="mt-2 text-sm text-zinc-400">更新: {w.updatedAt}{w.subtitle ? ` ・ ${w.subtitle}` : ''}</div>

      <div className="mt-6 text-sm text-zinc-300">
        ここに説明、スクショ、リンク（itch.io / GitHub / デモ）を置く想定。
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/posts/*" element={<PostPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/misc" element={<MiscPage />} />
          <Route path="/works/:id" element={<WorkDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)