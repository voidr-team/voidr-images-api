import express from 'express'
import transformerFormatters from '#src/domain/services/image/transformerFormatters'
import imageService from '#src/domain/services/image/imageService'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import HttpException from '#src/domain/exceptions/HttpException'
import logger from '#src/domain/logger'
import { imageConfig } from '#src/models/Image/imageConfig'
import getImageNameFromUrl from '#src/utils/image/getImageNameFromUrl'
import url from 'node:url'
const router = express.Router()

router.post('/images/process', async (req, res) => {
  const imageId = req.body.imageId

  const pendingProcessImage = await imageRepository.getById(imageId)

  if (!pendingProcessImage) {
    logger.error('Image not found to process', { imageId })
    throw new HttpException(404, 'Image not found')
  }

  const transformers = pendingProcessImage.transformers
  const transformPipeline = pendingProcessImage.transformPipeline
  const remote = pendingProcessImage.remote
  const project = pendingProcessImage.project
  const originUrl = pendingProcessImage.originUrl

  try {
    logger.info('Start async background processing', {
      imageId,
      transformers,
      remote,
      originUrl,
      project,
    })

    const { imageTransformer, rawImageMetadata, imageMetadata } =
      await imageService.executePipeline(
        remote,
        transformers,
        transformPipeline
      )

    logger.info('Saving image in bucket', {
      imageId,
      transformers,
      remote,
      originUrl,
      project,
    })

    const currentProject = await projectRepository.getByName(project)

    const { bucketFile } = await imageService.saveImageInBucket({
      imageTransformer,
      project: currentProject,
      remoteImageUrl: remote,
      baseFilePath: transformers,
      imageMetadata,
    })

    const imagePayload = {
      bucketFile: bucketFile.name,
      metadata: imageMetadata,
      rawMetadata: rawImageMetadata,
      status: imageConfig.status.COMPLETED,
    }

    await imageRepository.update(pendingProcessImage._id, imagePayload)

    logger.info('Finish background processing', {
      imageId,
      transformers,
      remote,
      originUrl,
      project,
    })
    return res.status(200).send({ message: 'Image process successfully' })
  } catch (e) {
    logger.error('Failed to process image', {
      imageId,
      error: e,
      transformers,
      remote,
      originUrl,
      project,
    })

    await imageRepository.update(pendingProcessImage._id, {
      status: imageConfig.status.FAILED,
    })
    return res.status(500).send({ message: 'Internal error' })
  }
})

export default router
