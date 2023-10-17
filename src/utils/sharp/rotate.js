export default async function rotate(sharp, file, angle) {
  return await sharp(file).rotate(angle).toBuffer({ resolveWithObject: true })
}
