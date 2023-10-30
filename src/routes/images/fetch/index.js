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

router.get(
  '/images/:project/:transformers(*)/fetch/:remote(*)',
  async (req, res) => {
    const { transformers = '', remote: remoteBaseUrl, project } = req.params
    const rawQueryStrings = url.parse(req.url).query
    const remote = `${remoteBaseUrl}${
      rawQueryStrings ? '?' + rawQueryStrings : ''
    }`
    const originUrl = req.baseUrl + req.path
    try {
      const [currentProject, existedImage] = await Promise.all([
        projectRepository.getByName(project),
        imageRepository.getByOriginUrl(originUrl),
      ])

      if (!currentProject) {
        throw new HttpException(404, `project "${project}" not found`)
      }

      if (
        existedImage &&
        existedImage.status === imageConfig.status.COMPLETED
      ) {
        logger.info('Image found on database', {
          transformers,
          remote,
          originUrl,
          project,
        })

        const bucketFile = imageService.getImageFromBucket(
          existedImage,
          currentProject
        )

        const fileRead = bucketFile.createReadStream()

        if (fileRead) {
          let headers = {
            'Content-Type': `image/${existedImage.metadata.format}`,
            'Cache-Control': 'public, max-age=2592000',
          }
          const responseFile = new Promise((resolve, reject) => {
            res.status(200).set(headers)
            fileRead
              .on('error', () => {
                resolve(false)
              })
              .pipe(res)
              .on('end', () => {
                resolve(true)
              })
          })

          const fileWasSent = await responseFile
          if (fileWasSent) {
            logger.info('Returning already process image', {
              transformers,
              remote,
              originUrl,
              project,
            })
            return
          } else {
            logger.info(
              'Image found on db but not on bucket, will start background process',
              {
                transformers,
                remote,
                originUrl,
                project,
              }
            )
          }
        }
      }

      const allowAllDomains = currentProject.domains.includes('*')
      const isAllowedDomain = currentProject.domains.find((domain) =>
        remote.startsWith(domain)
      )

      if (!allowAllDomains && !isAllowedDomain) {
        throw new HttpException(
          422,
          `remote image url domain is not allowed in project "${project}"`
        )
      }

      let noCacheHeaders = {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
      }

      // send response and process image in background
      res.set(noCacheHeaders)
      res.redirect(303, remote)

      logger.info('Start background processing', {
        transformers,
        remote,
        originUrl,
        project,
      })
      // Start processing image
      const parsedTransformers =
        transformerFormatters.formatFromParams(transformers)

      const transformPipeline =
        transformerFormatters.getTransformersPipeline(transformers)

      const imageName = getImageNameFromUrl(remote)

      const imagePendingProcessPayload = {
        name: imageName,
        remote,
        transformers: parsedTransformers,
        originUrl,
        status: imageConfig.status.PENDING,
      }

      const pendingProcessImage =
        existedImage ||
        (await imageRepository.create(project, imagePendingProcessPayload))

      const { imageTransformer, rawImageMetadata, imageMetadata } =
        await imageService.executePipeline(
          remote,
          parsedTransformers,
          transformPipeline
        )

      logger.info('Saving image in bucket', {
        transformers,
        remote,
        originUrl,
        project,
      })

      const { bucketFile } = await imageService.saveImageInBucket({
        imageTransformer,
        project: currentProject,
        remoteImageUrl: remote,
        baseFilePath: transformers,
        imageMetadata,
      })

      const imagePayload = {
        name: imageName,
        remote,
        bucketFile: bucketFile.name,
        transformers: parsedTransformers,
        metadata: imageMetadata,
        rawMetadata: rawImageMetadata,
        originUrl,
        status: imageConfig.status.COMPLETED,
      }

      if (pendingProcessImage._id) {
        await imageRepository.update(pendingProcessImage._id, imagePayload)
      } else {
        await imageRepository.create(project, imagePayload)
      }

      logger.info('Finish background processing', {
        transformers,
        remote,
        originUrl,
        project,
        imageId: pendingProcessImage._id,
      })
    } catch (e) {
      logger.error('Failed to process image', {
        error: e,
        transformers,
        remote,
        originUrl,
        project,
      })

      if (req.query.debug) {
        throw e
      }

      if (!res.headersSent) {
        let noCacheHeaders = {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
        }
        res.set(noCacheHeaders)
        res.redirect(remote)
      }

      const failedImage = await imageRepository.getByOriginUrl(originUrl)
      if (failedImage)
        await imageRepository.update(failedImage._id, {
          status: imageConfig.status.FAILED,
        })
    }
  }
)

export default router
