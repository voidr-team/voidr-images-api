import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import imageTransformFactory from '#src/domain/services/image/imageTransform'
import getImageNameFromUrl from '#src/utils/image/getImageNameFromUrl'
import getStorage from '#src/utils/storage/getStorage'

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

const saveImageInBucket = async ({
  imageTransformer,
  project,
  remoteImageUrl,
  baseFilePath,
}) => {
  const imageMetadata = await imageTransformer.sharpChain.metadata()

  const imageName = getImageNameFromUrl(remoteImageUrl)

  const storage = getStorage()

  const bucket = storage.bucket('voidr_images_test')

  const bucketFile = bucket.file(
    `${project}/remote/${baseFilePath}/${imageName}.${imageMetadata}`
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
