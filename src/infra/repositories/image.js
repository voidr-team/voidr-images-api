import { Image, ImageSchema } from '#models/Image'

/**
 * @param {Issuer} issuer
 * @param {ImageSchema} raw
 */
const create = async (project, raw) => {
  const newImage = new Image({
    ...raw,
    project,
  })
  return (await newImage.save()).toObject()
}

/** @param {Issuer} issuer */
const list = async (project) => {
  const images = await Image.find({
    project,
  }).exec()
  return images
}

/**  @param {string} originUrl */
const getByOriginUrl = async (originUrl) => {
  const image = await Image.findOne({ originUrl }).exec()
  return image
}

const imageRepository = {
  create,
  list,
  getByOriginUrl,
}
export default imageRepository
