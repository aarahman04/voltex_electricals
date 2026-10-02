import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import {
  ADMIN_PATHS, AdminInputError, applyAdminAction, emptyCuration, emptyProducts, emptyTaxonomy, serialize,
} from './src/data/adminActions.js'

const ROOT = import.meta.dirname
const UPLOADS = join(ROOT, 'Products', 'admin', '.uploads')
const EMPTY = { curation: emptyCuration, products: emptyProducts, taxonomy: emptyTaxonomy }

const readState = () => Object.fromEntries(
  Object.entries(ADMIN_PATHS).map(([key, rel]) => {
    const path = join(ROOT, rel)
    return [key, existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : EMPTY[key]()]
  }),
)

const isWebp = (bytes) => bytes.length > 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP'

// Dev-only twin of api/admin.js: the same applyAdminAction reducer, but it
// writes files on disk instead of committing to GitHub, then re-runs the ETL
// so changes show up via HMR. There is no login in dev. Not registered for
// `vite build` — ships nothing to production.
function adminPlugin() {
  return {
    name: 'voltex-admin',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__admin', (req, res) => {
        const send = (status, data) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }
        const view = (state) => ({ authenticated: true, ...state })

        if (req.method === 'GET') {
          const state = readState()
          if (req.url.includes('ids')) return send(200, { removed: state.curation.removed.map((item) => ({ uid: item.uid })) })
          return send(200, view(state))
        }
        if (req.method !== 'POST') return send(405, { error: 'Method not allowed' })

        const chunks = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', () => {
          try {
            const action = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            if (action.type === 'login' || action.type === 'logout') return send(200, { ok: true })

            if (action.type === 'upload') {
              const bytes = Buffer.from(String(action.data ?? ''), 'base64')
              if (!isWebp(bytes)) throw new AdminInputError('Invalid photo: expected a WebP image')
              const blobSha = createHash('sha1').update(bytes).digest('hex')
              mkdirSync(UPLOADS, { recursive: true })
              writeFileSync(join(UPLOADS, `${blobSha}.webp`), bytes)
              return send(200, { ok: true, blobSha })
            }

            const before = readState()
            const result = applyAdminAction(before, action)
            let changed = false
            for (const key of Object.keys(ADMIN_PATHS)) {
              if (JSON.stringify(result[key]) === JSON.stringify(before[key])) continue
              mkdirSync(dirname(join(ROOT, ADMIN_PATHS[key])), { recursive: true })
              writeFileSync(join(ROOT, ADMIN_PATHS[key]), serialize(result[key]))
              changed = true
            }
            for (const file of result.files.add) {
              const source = join(UPLOADS, `${file.blobSha}.webp`)
              if (!existsSync(source)) throw new AdminInputError('A photo upload expired. Add the photo again.')
              mkdirSync(dirname(join(ROOT, file.path)), { recursive: true })
              copyFileSync(source, join(ROOT, file.path))
              changed = true
            }
            for (const path of result.files.delete) rmSync(join(ROOT, path), { force: true })
            if (changed) execFileSync('node', ['scripts/normalize.mjs'], { cwd: ROOT, encoding: 'utf8' })
            send(200, { ok: true, changed, created: result.created, ...view(result) })
          } catch (error) {
            if (error instanceof AdminInputError || error.message?.startsWith('Invalid')) return send(400, { error: error.message })
            console.error(error)
            send(500, { error: String(error) })
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), adminPlugin()],
})
