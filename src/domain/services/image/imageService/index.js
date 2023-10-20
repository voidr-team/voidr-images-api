import HttpException from '#src/domain/exceptions/HttpException'
import downloadImageBuffer from '#src/utils/request/downloadImageBuffer'
import imageTransformFactory from '#src/domain/services/image/imageTransform'

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

  await imageTransformer.toFile('test.webp').execute()
}

const imageService = {
  executePipeline,
}

export default imageService
