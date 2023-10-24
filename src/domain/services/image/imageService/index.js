import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import imageTransformFactory, {
  ImageTransform,
} from '#src/domain/services/image/imageTransform'
import getImageNameFromUrl from '#src/utils/image/getImageNameFromUrl'
import getStorage from '#src/utils/storage/getStorage'

/**
 * @param {string} remoteImg
 * @param {object} transforms
 * @param {string[]} transformPipeline
 */
const executePipeline = async (remoteImg, transforms, transformPipeline) => {
  const imageBuffer = await downloadImageBuffer(remoteImg)

  const imageTransformer = imageTransformFactory(imageBuffer)

  transformPipeline.forEach((task) => {
    const taskToRun = imageTransformer[task]
    if (!taskToRun) {
      throw new HttpException(422, `unknown transformer "${task}"`)
    }
    taskToRun(transforms)
  })

  await imageTransformer.execute()

  return imageTransformer
}

/**
 * @param {{
 *  imageTransformer: ImageTransform,
 *  project: string,
 *  remoteImageUrl: string,
 *  baseFilePath: string
 * }} params
 */
const saveImageInBucket = async ({
  imageTransformer,
  project,
  remoteImageUrl,
  baseFilePath,
}) => {
  const imageMetadata = await imageTransformer.bufferWithMetadata()

  const imageName = getImageNameFromUrl(remoteImageUrl)

  const storage = getStorage()

  const bucket = storage.bucket('voidr_images_test')

  const underscoredFilePath = baseFilePath.replace('/', '_')

  const bucketFile = bucket.file(
    `${project}/remote/${imageName}/${underscoredFilePath}/${imageName}.${imageMetadata.info.format}`
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
    imageMetadata,
  }
}

const imageService = {
  executePipeline,
  saveImageInBucket,
}

export default imageService
