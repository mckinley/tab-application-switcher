import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Read manifest to get version
const manifestPath = path.join(rootDir, 'dist', 'manifest.json')
const manifestContent = fs.readFileSync(manifestPath, 'utf8')
const manifest = JSON.parse(manifestContent) as { version: string }
const version = manifest.version

// Create package directory if it doesn't exist
const packageDir = path.join(rootDir, 'package')
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true })
}

// Create zip file
const outputPath = path.join(packageDir, `tab-application-switcher-${version}.zip`)
const output = fs.createWriteStream(outputPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`✓ Created ${outputPath} (${archive.pointer()} bytes)`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)
archive.directory(path.join(rootDir, 'dist'), false)
void archive.finalize()
