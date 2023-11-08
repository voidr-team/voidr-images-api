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
import projectService from '#src/domain/services/project'
import { projectConfig } from '#src/models/Project/projectConfig'
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

    let noCacheHeaders = {
      'Cache-Control':
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
    }

    try {
      const [currentProject, existedImage] = await Promise.all([
        projectRepository.getByName(project),
        imageRepository.getByOriginUrl(originUrl),
      ])

      if (!currentProject) {
        throw new HttpException(404, `project "${project}" not found`)
      }

      if (
        currentProject.plan === projectConfig.plans &&
        currentProject.freePlanExpired
      ) {
        throw new HttpException(429, 'free quota utilization exceeded')
      }

      if (existedImage && existedImage.status === imageConfig.status.PENDING) {
        logger.info('Image still processing', {
          transformers,
          remote,
          originUrl,
          project,
        })
        res.set(noCacheHeaders)
        res.redirect(303, remote)
        return
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
              'Image found on db but not on bucket, will start process',
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
      const isAllowedDomain = currentProject.domains.find(
        (domain) =>
          remote.startsWith(domain) || remote.startsWith('https://api.voidr.co')
      )

      if (!allowAllDomains && !isAllowedDomain) {
        throw new HttpException(
          422,
          `remote image url domain is not allowed in project "${project}"`
        )
      }

      const parsedTransformers =
        transformerFormatters.formatFromParams(transformers)

      const transformPipeline =
        transformerFormatters.getTransformersPipeline(transformers)

      const imageName = getImageNameFromUrl(remote)

      logger.info('Start processing', {
        transformers,
        remote,
        originUrl,
        project,
      })

      const imagePendingProcessPayload = {
        name: imageName,
        remote,
        transformers: parsedTransformers,
        originUrl,
        status: imageConfig.status.PENDING,
        transformPipeline,
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

      logger.info('Finish processing', {
        transformers,
        remote,
        originUrl,
        project,
        imageId: pendingProcessImage._id,
      })

      let headers = {
        'Content-Type': `image/${imageMetadata.format}`,
        'Cache-Control': 'public, max-age=2592000',
      }

      await projectService.updateFreeTrialUtilization(currentProject)

      const fileRead = bucketFile.createReadStream()
      res.status(200).set(headers)
      return fileRead.pipe(res)
    } catch (e) {
      logger.error(e.message || 'Failed to process image', {
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
        res.set(noCacheHeaders)
        res.redirect(303, remote)
      }

      // free quota limit
      if (e.status === 429) {
        return
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
