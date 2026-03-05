import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL

  return {
    plugins: [
      react(),
      ...(apiTarget
        ? [
            {
              name: 'gas-proxy',
              configureServer(server: any) {
                server.middlewares.use('/api', (req: any, res: any, next: any) => {
                  let rawBody = ''
                  req.on('data', (chunk: Buffer) => { rawBody += chunk.toString() })
                  req.on('end', async () => {
                    try {
                      const qs = req.url && req.url.length > 1 ? req.url : ''
                      const url = qs ? `${apiTarget}${qs}` : apiTarget

                      // Use global fetch (Node 18+) - follows redirects automatically
                      const gasRes = await (globalThis as any).fetch(url, {
                        method: req.method === 'GET' ? 'GET' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: req.method !== 'GET' && rawBody ? rawBody : undefined,
                        redirect: 'follow',
                      })

                      const text = await gasRes.text()
                      res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                      })
                      res.end(text)
                    } catch (err: any) {
                      res.writeHead(200, { 'Content-Type': 'application/json' })
                      res.end(JSON.stringify({ success: false, error: 'Proxy error: ' + err.message }))
                    }
                  })
                })
              },
            },
          ]
        : []),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
  }
})
