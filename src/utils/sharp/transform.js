export default async function transform(sharp, file, format) {
  const data = await sharp(file)
    .toFormat(format)
    .toBuffer({ resolveWithObject: true })

  return data
}
