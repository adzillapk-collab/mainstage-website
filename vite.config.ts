import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const COPY_FILE = resolve(process.cwd(), 'src/content/copy.json')

/**
 * Dev-only endpoint for the copy editor (copy.html):
 * GET  /__copy  returns src/content/copy.json
 * POST /__copy  saves it, and the site reloads with the new words.
 */
function copyEditor(): Plugin {
  return {
    name: 'copy-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__copy', async (req, res) => {
        try {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            res.end(await readFile(COPY_FILE, 'utf8'))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            for await (const chunk of req) body += chunk
            const data = JSON.parse(body) // throws on invalid JSON, so the file is never corrupted
            await writeFile(COPY_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8')
            res.setHeader('Content-Type', 'application/json')
            res.end('{"ok":true}')
            return
          }
          res.statusCode = 405
          res.end()
        } catch (err) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: String(err) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyEditor()],
  // Polling avoids the Windows "EBUSY" watcher errors that left stale modules in the browser
  server: { port: 5173, watch: { usePolling: true, interval: 250 } },
})
