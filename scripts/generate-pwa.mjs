/**
 * PWA favicon generator script.
 * Run: npx tsx assets/scripts/generate-pwa.ts
 *
 * Converts the square logo SVG into PNGs at 16, 32, 180, 512px.
 * Requires sharp (npm i -D sharp).
 *
 * Usage: node scripts/generate-pwa.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import sharp from 'sharp'

const SVG_PATH = join(import.meta.dirname, '..', 'svg', 'logo', 'logo-square.svg')
const OUT_DIR = join(import.meta.dirname, '..', 'kalako-client', 'public')

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'maskable-512x512.png', size: 512, maskable: true },
]

async function main() {
  const svg = readFileSync(SVG_PATH, 'utf-8')
  mkdirSync(OUT_DIR, { recursive: true })

  for (const { name, size, maskable } of SIZES) {
    let svgContent = svg
    if (maskable) {
      // Add a safe area for maskable icons
      svgContent = svg.replace(
        '</svg>',
        `<rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="#12071F"/></svg>`
      )
    }
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(join(OUT_DIR, name))
    console.log(`✓ ${name} (${size}x${size})`)
  }

  // Generate webmanifest
  const manifest = {
    name: 'تحدي الإجابات',
    short_name: 'كلاكو',
    description: 'لعبة خداع جماعية',
    start_url: '/',
    display: 'standalone',
    background_color: '#12071F',
    theme_color: '#FF5DA2',
    orientation: 'portrait',
    icons: [
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  }
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log('✓ manifest.json')
}

main().catch(console.error)
