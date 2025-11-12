#!/usr/bin/env node

/**
 * Release script for Tab Application Switcher
 *
 * This script:
 * 1. Validates the working directory is clean
 * 2. Runs tests and linting
 * 3. Builds the extension
 * 4. Creates a git tag
 * 5. Provides instructions for creating a GitHub release
 *
 * Usage:
 *   npm run release        # Interactive - prompts for version
 *   npm run release 1.2.3  # Specify version directly
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

function exec(command: string, options: Record<string, unknown> = {}): void {
  try {
    execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options })
  } catch (_error) {
    console.error(`\n❌ Command failed: ${command}`)
    process.exit(1)
  }
}

function execQuiet(command: string): string | null {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim()
  } catch (_error) {
    return null
  }
}

function validateVersion(version: string): string {
  const semverRegex = /^\d+\.\d+\.\d+$/
  if (!semverRegex.test(version)) {
    console.error('❌ Invalid version format. Use semantic versioning (e.g., 1.2.3)')
    process.exit(1)
  }
  return version
}

function getCurrentVersion(): string {
  const manifestContent = readFileSync('./app/manifest.json', 'utf8')
  const manifest = JSON.parse(manifestContent) as { version: string }
  return manifest.version
}

function updateVersion(newVersion: string): void {
  // Update manifest.json
  const manifestPath = './app/manifest.json'
  const manifestContent = readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestContent) as { version: string }
  manifest.version = newVersion
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

  console.log(`✅ Updated manifest.json to version ${newVersion}`)
}

function checkGitStatus(): void {
  const status = execQuiet('git status --porcelain')
  if (status) {
    console.error('❌ Working directory is not clean. Commit or stash your changes first.')
    console.error('\nUncommitted changes:')
    console.error(status)
    process.exit(1)
  }
}

function checkGitRemote(): string {
  const remote = execQuiet('git remote get-url origin')
  if (!remote) {
    console.error('❌ No git remote found. Add a remote first.')
    process.exit(1)
  }
  return remote
}

async function main(): Promise<void> {
  console.log('🚀 Tab Application Switcher Release Script\n')

  // Get version from command line or prompt
  let newVersion = process.argv[2]
  const currentVersion = getCurrentVersion()

  if (!newVersion) {
    console.log(`Current version: ${currentVersion}`)
    newVersion = await question('Enter new version (e.g., 0.2.0): ')
    newVersion = newVersion.trim()
  }

  validateVersion(newVersion)

  if (newVersion === currentVersion) {
    console.error(`❌ New version (${newVersion}) is the same as current version`)
    process.exit(1)
  }

  console.log(`\n📦 Preparing release ${currentVersion} → ${newVersion}\n`)

  // Confirm
  const confirm = await question(`Create release v${newVersion}? (y/N): `)
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Release cancelled')
    process.exit(0)
  }

  rl.close()

  console.log('\n1️⃣  Checking git status...')
  checkGitStatus()
  const remote = checkGitRemote()

  console.log('\n2️⃣  Running tests and linting...')
  exec('npm run prep')

  console.log('\n3️⃣  Updating version...')
  updateVersion(newVersion)

  console.log('\n4️⃣  Building extension...')
  exec('npm run build')
  exec('bun scripts/pack.ts')

  console.log('\n5️⃣  Committing version bump...')
  exec('git add app/manifest.json')
  exec(`git commit -m "chore: bump version to ${newVersion}"`)

  console.log('\n6️⃣  Creating git tag...')
  exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`)

  console.log('\n✅ Release prepared successfully!\n')
  console.log('📋 Next steps:\n')
  console.log('1. Push the commit and tag:')
  console.log('   git push origin main')
  console.log(`   git push origin v${newVersion}`)
  console.log('')
  console.log('2. Create a GitHub Release:')
  console.log(`   - Go to: ${remote.replace('.git', '')}/releases/new`)
  console.log(`   - Tag: v${newVersion}`)
  console.log(`   - Title: v${newVersion}`)
  console.log(`   - Upload: package/tab-application-switcher-${newVersion}.zip`)
  console.log('   - Add release notes describing changes')
  console.log('')
  console.log('3. Submit to Chrome Web Store:')
  console.log('   - Upload the zip file from the package/ directory')
  console.log('')
}

void main().catch((error: Error) => {
  console.error('❌ Release failed:', error.message)
  process.exit(1)
})
