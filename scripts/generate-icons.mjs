import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const INPUT = path.resolve('public/icon.jpg')
const SIZES = [16, 32, 48, 256]

async function generate() {
  // Generate PNGs at each size
  const pngBuffers = await Promise.all(
    SIZES.map(size =>
      sharp(INPUT)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toBuffer()
    )
  )

  // Also save a 256x256 PNG for electron-builder (macOS)
  await writeFile('public/icon.png', pngBuffers[3])
  console.log('Created public/icon.png (256x256)')

  // Convert PNGs to .ico
  const icoBuffer = await pngToIco(pngBuffers)
  await writeFile('public/icon.ico', icoBuffer)
  console.log(`Created public/icon.ico (${SIZES.join(', ')}px)`)
}

generate().catch(console.error)
