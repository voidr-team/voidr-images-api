export default async function rounded(sharp, file, blur) {
  const { width, height } = await sharp(file).metadata()
  const rect = Buffer.from(
    `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${blur}" ry="${blur}"/></svg>`
  )

  return sharp(file)
    .resize(width, height, { fit: 'cover' })
    .png()
    .composite([{ input: rect, blend: 'dest-in' }])
    .toBuffer({ resolveWithObject: true })
}
