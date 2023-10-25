import express from 'express'
import transformerFormatters from '#src/domain/services/image/transformerFormatters'
import imageService from '#src/domain/services/image/imageService'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import HttpException from '#src/domain/exceptions/HttpException'
const router = express.Router()

router.get(
  '/images/:project/:transformers(*)/fetch/:remote(*)',
  async (req, res) => {
    const { transformers = '', remote, project } = req.params

    const originUrl = req.baseUrl + req.path

    const existedImage = await imageRepository.getByOriginUrl(originUrl)
    if (existedImage) {
      const bucketFile = imageService.getImageFromBucket(existedImage)
      const fileRead = bucketFile.createReadStream()

      let headers = {
        'Content-Type': `image/${existedImage.metadata.format}`,
      }

      res.status(200).set(headers)
      return fileRead.pipe(res)
    }

    const existedProject = await projectRepository.exists(project)
    if (!existedProject) {
      throw new HttpException(404, `project "${project}" not found`)
    }

    const parsedTransformers =
      transformerFormatters.formatFromParams(transformers)

    const transformPipeline =
      transformerFormatters.getTransformersPipeline(transformers)

    const { imageTransformer, rawImageMetadata, imageMetadata } =
      await imageService.executePipeline(
        remote,
        parsedTransformers,
        transformPipeline
      )

    const { bucketFile, imageName } = await imageService.saveImageInBucket({
      imageTransformer,
      project,
      remoteImageUrl: remote,
      baseFilePath: transformers,
      imageMetadata,
    })

    let headers = {
      'Content-Type': `image/${imageMetadata.format}`,
    }

    await imageRepository.create(project, {
      name: imageName,
      remote,
      bucketFile: bucketFile.name,
      transformers: parsedTransformers,
      metadata: imageMetadata,
      rawMetadata: rawImageMetadata,
      originUrl,
    })

    const fileRead = bucketFile.createReadStream()
    res.status(200).set(headers)
    fileRead.pipe(res)
  }
)

export default router
