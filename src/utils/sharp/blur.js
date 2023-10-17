export default async function blur(sharp, file, blur) {
  return await sharp(file).blur(blur).toBuffer({ resolveWithObject: true })
}
