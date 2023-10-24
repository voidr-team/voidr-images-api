import express from 'express'
import transformerFormatters from '#src/domain/services/image/transformerFormatters'
import imageService from '#src/domain/services/image/imageService'
const router = express.Router()

router.get(
  '/images/:project/:transforms(*)/fetch/:remote(*)',
  async (req, res) => {
    const { transforms = '', remote, project } = req.params

    const parsedTransforms = transformerFormatters.formatFromParams(transforms)

    const transformPipeline =
      transformerFormatters.getTransformersPipeline(transforms)

    const transformedImage = await imageService.executePipeline(
      remote,
      parsedTransforms,
      transformPipeline
    )

    const { bucketFile, imageMetadata } = await imageService.saveImageInBucket({
      imageTransformer: transformedImage,
      project,
      remoteImageUrl: remote,
      baseFilePath: transforms,
    })

    let headers = {
      'Content-Type': `image/${imageMetadata.info.format}`,
    }

    const fileRead = bucketFile.createReadStream()
    res.status(200).set(headers)
    fileRead.pipe(res)
  }
)

export default router
