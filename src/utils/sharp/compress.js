export default async function compress(sharp, file) {
  const imageFile = sharp(file)
    .jpeg({ progressive: true, force: false, quality: 50 })
    .png({ progressive: true, force: false, quality: 80 })
    .toBuffer({ resolveWithObject: true })

  return imageFile
}
