import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { normalizeCatalog } from './src/services/catalogNormalization.js'
import { defineConfig } from 'vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const publicBase = '/PC-Builder/'
const readCatalogFile = (name) => JSON.parse(
  readFileSync(resolve(projectRoot, 'src', 'assets', 'data', name), 'utf8'),
)

const publicCatalog = normalizeCatalog({
  cpus: readCatalogFile('cpu.json'),
  motherboards: readCatalogFile('motherboard.json'),
  memory: readCatalogFile('memory.json'),
  videoCards: readCatalogFile('video-card.json'),
})

const publicCatalogEndpoints = new Map([
  ['api/public/components.json', JSON.stringify(publicCatalog)],
  ...publicCatalog.map((item) => [
    `api/public/components/${encodeURIComponent(String(item.id))}.json`,
    JSON.stringify(item),
  ]),
])

function publicCatalogPlugin() {
  let buildVersion = ''

  return {
    name: 'public-catalog-endpoints',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://vite.local').pathname
        const endpointPath = pathname.startsWith(publicBase)
          ? pathname.slice(publicBase.length)
          : pathname.replace(/^\/+/, '')
        const body = publicCatalogEndpoints.get(endpointPath)

        if (body === undefined) {
          next()
          return
        }

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.end(body)
      })
    },
    generateBundle(_options, bundle) {
      publicCatalogEndpoints.forEach((source, fileName) => {
        this.emitFile({ type: 'asset', fileName, source })
      })

      const buildContents = Object.entries(bundle)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([fileName, output]) => {
          const contents = output.type === 'chunk' ? output.code : output.source
          return `${fileName}\0${contents}`
        })
        .join('\n')
      const version = createHash('sha256')
        .update(buildContents)
        .update(JSON.stringify(publicCatalog))
        .digest('hex')
        .slice(0, 12)
      buildVersion = version
    },
    closeBundle() {
      if (!buildVersion) return
      const serviceWorkerPath = resolve(projectRoot, 'dist', 'sw.js')
      const source = readFileSync(serviceWorkerPath, 'utf8')
      writeFileSync(
        serviceWorkerPath,
        source.replace('__BUILD_VERSION__', buildVersion),
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), publicCatalogPlugin()],
  base: publicBase,
  build: {
    manifest: 'build-manifest.json',
  },
})
