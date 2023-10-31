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

/**
 * @param {string} id
 * @param {ImageSchema} raw
 */
const update = async (id, raw) => {
  const image = await Image.updateOne({ _id: id }, raw).exec()
  return image
}

const paginate = async (projectName, page = 1, limit = 10) => {
  const totalQuery = Image.countDocuments()
  const imagesQuery = Image.find({ project: projectName })
    .limit(limit)
    .skip((page - 1) * limit)
    .exec()

  const [total, images] = await Promise.all([totalQuery, imagesQuery])

  return {
    total,
    images,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  }
}

const imageRepository = {
  create,
  list,
  update,
  getByOriginUrl,
  paginate,
}
export default imageRepository
