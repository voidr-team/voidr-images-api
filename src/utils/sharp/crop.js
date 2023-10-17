export default async function crop(sharp, file, width, height) {
  return await sharp(file)
    .resize({ width, height })
    .toBuffer({ resolveWithObject: true })
}
