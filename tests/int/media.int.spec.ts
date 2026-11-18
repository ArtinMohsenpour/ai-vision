// @vitest-environment node -- Payload inspects upload bytes; jsdom breaks binary type checks.
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload
const stamp = Date.now()
const created: number[] = []

const file = (name: string, mimetype: string, data: Buffer) => ({ name, mimetype, data, size: data.length })

async function raster(format: 'png' | 'jpeg', width = 1200, height = 800) {
  return sharp({ create: { width, height, channels: 4, background: { r: 40, g: 110, b: 90, alpha: 0.6 } } })
    .toFormat(format)
    .toBuffer()
}

async function upload(name: string, mimetype: string, data: Buffer) {
  const doc = await payload.create({
    collection: 'media',
    data: { alt: `Test ${name}` },
    file: file(name, mimetype, data),
  })
  created.push(doc.id)
  return doc
}

describe('media uploads', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    // Deleting the documents also removes the stored files and sizes.
    if (created.length) await payload.delete({ collection: 'media', where: { id: { in: created } } })
  })

  it.each(['png', 'jpeg'] as const)('converts %s to WebP and stores only the WebP', async (format) => {
    const doc = await upload(`photo-${stamp}.${format === 'jpeg' ? 'jpg' : 'png'}`, `image/${format}`, await raster(format))
    expect(doc.mimeType).toBe('image/webp')
    expect(doc.filename).toMatch(/\.webp$/)
    for (const size of ['thumbnail', 'card'] as const) {
      expect(doc.sizes?.[size]?.mimeType).toBe('image/webp')
      expect(doc.sizes?.[size]?.filename).toMatch(/\.webp$/)
    }
  })

  it('scales very large images down to 2560 px', async () => {
    const doc = await upload(`large-${stamp}.png`, 'image/png', await raster('png', 4000, 2000))
    expect(doc.width).toBe(2560)
    expect(doc.height).toBe(1280)
  })

  it('stores a safe SVG unchanged', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>')
    const doc = await upload(`logo-${stamp}.svg`, 'image/svg+xml', svg)
    expect(doc.mimeType).toBe('image/svg+xml')
    expect(doc.filename).toMatch(/\.svg$/)
  })

  it('rejects an SVG with a script', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
    await expect(upload(`unsafe-${stamp}.svg`, 'image/svg+xml', svg)).rejects.toThrow()
  })

  it('rejects files that are not images', async () => {
    await expect(upload(`notes-${stamp}.pdf`, 'application/pdf', Buffer.from('%PDF-1.4 test'))).rejects.toThrow()
    await expect(upload(`fake-${stamp}.png`, 'image/png', Buffer.from('<html>not an image</html>'))).rejects.toThrow()
  })
})

describe('admin accounts', () => {
  beforeAll(async () => {
    payload ??= await getPayload({ config: await config })
  })

  it('require a first and last name', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: { email: `nameless.${stamp}@content.test`, password: `pw-${stamp}-long` } as never,
      }),
    ).rejects.toThrow()
  })
})
