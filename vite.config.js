import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const ROOT = import.meta.dirname
const CURATION_PATH = join(ROOT, 'Products', 'curation.json')

// Dev-only: lets the /curate page read + write Products/curation.json and
// re-run the ETL, so removals show up via HMR without a manual rebuild.
// Not registered for `vite build` — ships nothing to production.
function curatePlugin() {
  return {
    name: 'voltex-curate',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__curate', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(readFileSync(CURATION_PATH, 'utf8'))
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              writeFileSync(CURATION_PATH, JSON.stringify(data, null, 2) + '\n')
              const output = execFileSync('node', ['scripts/normalize.mjs'], {
                cwd: ROOT,
                encoding: 'utf8',
              })
              const report = output.trim().split('\n')[0] ?? ''
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true, report }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: false, error: String(err) }))
            }
          })
          return
        }
        res.statusCode = 405
        res.end()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), curatePlugin()],
})
