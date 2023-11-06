import { Image, ImageSchema } from '#models/Image'
import { ProjectSchema } from '#src/models/Project'

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
  })
    .lean()
    .exec()
  return images
}

/**  @param {string} originUrl */
const getByOriginUrl = async (originUrl) => {
  const image = await Image.findOne({ originUrl }).lean().exec()
  return image
}

/**
 * @param {string} id
 * @param {ImageSchema} raw
 */
const update = async (id, raw) => {
  const image = await Image.findOneAndUpdate({ _id: id }, raw, {
    new: true,
  })
    .lean()
    .exec()
  return image
}

const paginate = async (projectName, page = 1, limit = 10) => {
  const totalQuery = Image.countDocuments({ project: projectName })
  const imagesQuery = Image.find({ project: projectName })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()
    .exec()

  const [total, images] = await Promise.all([totalQuery, imagesQuery])

  return {
    total,
    images,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  }
}
/**
 * @param {string} id
 **/
const getById = async (id) => {
  const image = await Image.findById(id)
    .lean()
    .exec()
    .catch(() => null)
  return image
}

/**
 * @param {ImageSchema} image
 * @param {ProjectSchema} project
 **/
const getRelativeImages = async (image, project) => {
  const relatives = await Image.find({
    name: image.name,
    project: project.name,
  })
    .lean()
    .exec()

  return relatives
}

/** @param {string} projectName */
const countPerDay = async (projectName) => {
  const result = await Image.aggregate([
    {
      $match: {
        project: projectName,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
      },
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
        },
        count: 1,
        _id: 0,
      },
    },
  ]).exec()

  return result
}
/**
 * @param {string} projectName
 * @returns {number}
 */
const bytesSaved = async (projectName) => {
  const result = await Image.aggregate([
    {
      $match: {
        project: projectName,
      },
    },
    {
      $group: {
        _id: null,
        totalBytesSaved: {
          $sum: {
            $subtract: ['$rawMetadata.size', '$metadata.size'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalBytesSaved: 1,
      },
    },
  ])

  return result[0]?.totalBytesSaved || 0
}

/**
 * @param {string} projectName
 */
const countByProject = async (projectName) => {
  const total = await Image.countDocuments({ project: projectName })
  return total
}

const imageRepository = {
  create,
  list,
  update,
  getByOriginUrl,
  paginate,
  getById,
  getRelativeImages,
  countPerDay,
  bytesSaved,
  countByProject,
}
export default imageRepository
