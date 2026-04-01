import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const INPUT = path.resolve('public/icon.jpg')
const ICO_SIZES = [16, 32, 48, 256]
const PWA_SIZES = [192, 512]

async function generate() {
  // Generate PNGs for .ico
  const pngBuffers = await Promise.all(
    ICO_SIZES.map(size =>
      sharp(INPUT)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toBuffer()
    )
  )

  // Save 256x256 PNG for electron-builder (macOS)
  await writeFile('public/icon.png', pngBuffers[3])
  console.log('Created public/icon.png (256x256)')

  // Convert PNGs to .ico
  const icoBuffer = await pngToIco(pngBuffers)
  await writeFile('public/icon.ico', icoBuffer)
  console.log(`Created public/icon.ico (${ICO_SIZES.join(', ')}px)`)

  // Generate PWA icons
  for (const size of PWA_SIZES) {
    const buf = await sharp(INPUT)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer()
    await writeFile(`public/pwa-${size}x${size}.png`, buf)
    console.log(`Created public/pwa-${size}x${size}.png`)
  }
}

generate().catch(console.error)
