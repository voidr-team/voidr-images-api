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

    const [currentProject, existedImage] = await Promise.all([
      projectRepository.getByName(project),
      imageRepository.getByOriginUrl(originUrl),
    ])

    if (!currentProject) {
      throw new HttpException(404, `project "${project}" not found`)
    }

    if (existedImage) {
      const bucketFile = imageService.getImageFromBucket(
        existedImage,
        currentProject
      )

      const [bucketFileExists] = await bucketFile.exists()

      if (bucketFileExists) {
        const fileRead = bucketFile.createReadStream()

        let headers = {
          'Content-Type': `image/${existedImage.metadata.format}`,
        }

        res.status(200).set(headers)
        return fileRead.pipe(res)
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
      project: currentProject,
      remoteImageUrl: remote,
      baseFilePath: transformers,
      imageMetadata,
    })

    let headers = {
      'Content-Type': `image/${imageMetadata.format}`,
    }

    const imagePayload = {
      name: imageName,
      remote,
      bucketFile: bucketFile.name,
      transformers: parsedTransformers,
      metadata: imageMetadata,
      rawMetadata: rawImageMetadata,
      originUrl,
    }

    if (existedImage) {
      await imageRepository.update(existedImage.id, imagePayload)
    } else {
      await imageRepository.create(project, imagePayload)
    }

    const fileRead = bucketFile.createReadStream()
    res.status(200).set(headers)
    fileRead.pipe(res)
  }
)

export default router
