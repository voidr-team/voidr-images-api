import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import imageTransformFactory, {
  ImageTransform,
} from '#src/domain/services/image/imageTransform'
import getImageNameFromUrl from '#src/utils/image/getImageNameFromUrl'
import getStorage from '#src/utils/storage/getStorage'
import sharp from 'sharp'
import { ImageSchema } from '#src/models/Image'
import { ProjectSchema } from '#src/models/Project'
import config from '#src/config'
/**
 * @param {string} remoteImg
 * @param {object} transformers
 * @param {string[]} transformPipeline
 */
const executePipeline = async (remoteImg, transformers, transformPipeline) => {
  const imageBuffer = await downloadImageBuffer(remoteImg)

  const imageTransformer = await imageTransformFactory(imageBuffer)

  const rawImageMetadata = imageTransformer.rawImageMetadata

  transformPipeline.forEach((task) => {
    const taskToRun = imageTransformer[task]
    if (!taskToRun) {
      throw new HttpException(422, `unknown transformer "${task}"`)
    }
    if (task !== 'watermark') taskToRun(transformers)
  })

  await imageTransformer.execute()

  if (transformPipeline.includes('watermark')) {
    await imageTransformer.watermark(transformers)
  }

  const imageMetadata = imageTransformer.imageMetadata

  return { imageTransformer, rawImageMetadata, imageMetadata }
}

/**
 * @param {{
 *  imageTransformer: ImageTransform,
 *  project: ProjectSchema,
 *  remoteImageUrl: string,
 *  baseFilePath: string
 *  imageMetadata: sharp.OutputInfo
 * }} params
 */
const saveImageInBucket = async ({
  imageTransformer,
  project,
  remoteImageUrl,
  baseFilePath,
  imageMetadata,
}) => {
  const imageName = getImageNameFromUrl(remoteImageUrl)

  const storage = getStorage()

  const bucket = storage.bucket(project.bucket.name)

  const underscoredFilePath = baseFilePath.replaceAll('/', '_')

  const bucketFile = bucket.file(
    `${config.IS_LOCAL ? 'local/' : ''}${
      project.name
    }/remote/${imageName}/${underscoredFilePath}/${imageName}.${
      imageMetadata.format
    }`
  )

  const bucketFileWStream = bucketFile.createWriteStream()

  const endWrite = new Promise((resolve, reject) => {
    imageTransformer
      .pipe(bucketFileWStream)
      .on('finish', resolve)
      .on('error', reject)
  }).catch((e) => {
    throw e
  })

  await endWrite

  return {
    bucketFile,
    imageName,
  }
}

/**
 * @param {ImageSchema} image
 * @param {ProjectSchema} project
 **/
const getImageFromBucket = (image, project) => {
  const bucket = getBucketFromProject(project)

  const bucketFile = bucket.file(image.bucketFile)

  return bucketFile
}
/**
 * @param {ProjectSchema} project
 **/
const getBucketFromProject = (project) => {
  const storage = getStorage()

  const bucket = storage.bucket(project.bucket.name)

  return bucket
}

const imageService = {
  executePipeline,
  saveImageInBucket,
  getImageFromBucket,
  getBucketFromProject,
}

export default imageService
