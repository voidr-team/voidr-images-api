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

  const imageTransformer = imageTransformFactory(imageBuffer)

  const rawImageMetadata = (await imageTransformer.bufferWithMetadata()).info

  transformPipeline.forEach((task) => {
    const taskToRun = imageTransformer[task]
    if (!taskToRun) {
      throw new HttpException(422, `unknown transformer "${task}"`)
    }
    taskToRun(transformers)
  })

  await imageTransformer.execute()

  const imageMetadata = (await imageTransformer.bufferWithMetadata()).info

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
  const storage = getStorage()

  const bucket = storage.bucket(project.bucket.name)

  const bucketFile = bucket.file(image.bucketFile)

  return bucketFile
}

const imageService = {
  executePipeline,
  saveImageInBucket,
  getImageFromBucket,
}

export default imageService
