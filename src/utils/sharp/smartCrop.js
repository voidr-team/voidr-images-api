export default async function smartCrop(sharp, file, width, height) {
  return await smartCrop.crop(file, { width, height }).then(async (value) => {
    const crop = value.topCrop
    return sharp(file)
      .extract({
        width: crop.width,
        height: crop.height,
        left: crop.x,
        top: crop.y,
      })
      .resize(width, height)
      .toBuffer({ resolveWithObject: true })
      .then((data) => data)
  })
}
