import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 중에 /api/* 를 Vercel 없이 처리하는 플러그인.
// api/ 폴더의 서버 함수를 그대로 불러 실행하므로 배포본(Vercel)과 같은 코드가 돌아갑니다.
// .env.local 의 값(DATA_GO_KR_KEY, ANTHROPIC_API_KEY …)을 서버 함수가 읽을 수 있게 넣어 줍니다.
function devApi(env) {
  return {
    name: 'tamna-dev-api',
    configureServer(server) {
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v

      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.slice('/api/'.length)
        if (!/^[a-z]+$/.test(name)) return next()

        // Vercel 의 req.query / req.body / res.status().json() 모양을 흉내 냅니다
        req.query = Object.fromEntries(url.searchParams)
        res.status = (code) => { res.statusCode = code; return res }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
        }
        try {
          if (req.method === 'POST') {
            const chunks = []
            for await (const c of req) chunks.push(c)
            const raw = Buffer.concat(chunks).toString('utf8')
            req.body = raw ? JSON.parse(raw) : {}
          }
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          await mod.default(req, res)
        } catch (e) {
          if (!res.headersSent) res.status(/Failed to load url|Cannot find/.test(e.message) ? 404 : 500).json({ error: e.message })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devApi(loadEnv(mode, process.cwd(), ''))],
  build: { chunkSizeWarningLimit: 1500 }, // three.js 는 원래 큼
}))
