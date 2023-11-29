import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import auth from '#src/middlewares/auth'
import imageRepository from '#src/infra/repositories/image'
import getStorage from '#src/utils/storage/getStorage'
import imageService from '#src/domain/services/image/imageService'
import validateSchema from '#src/middlewares/validateSchema'
import { uploadSchema } from './schema'
import logger from '#src/domain/logger'
import HttpException from '#src/domain/exceptions/HttpException'
const router = express.Router()

router.get('/images', auth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  const images = await imageRepository.paginate(project.name, page, limit)
  return res.json(images)
})

router.get('/images/raw/:project/:file', async (req, res) => {
  const { file, project } = req.params
  try {
    const currentProject = await projectRepository.getByName(project)
    if (!currentProject) {
      throw new HttpException(404, 'project not found')
    }

    const bucket = imageService.getBucketFromProject(currentProject)
    const filePath = `${currentProject.name}/raw/${file}`
    const bucketFile = bucket.file(filePath)
    const [exists] = await bucketFile.exists()

    if (!exists) {
      throw new HttpException(404, 'image not found')
    }

    const [url] = await bucketFile.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    })

    res.redirect(url)
  } catch (e) {
    logger.error(e)
    return res.status(404).send('Image not found')
  }
})

router.post(
  '/images/upload',
  auth,
  validateSchema(uploadSchema),
  async (req, res) => {
    const issuer = getIssuer(req)

    const project = await projectRepository.getByOrgId(issuer.organizationId)

    const bucket = imageService.getBucketFromProject(project)
    const filename = req.body.file
    let rawFile = bucket.file(`${project.name}/raw/` + req.body.file)
    const [alreadyExist] = await rawFile.exists()

    if (alreadyExist) {
      const timestamp = Date.now()
      const fileExtension = filename.substring(filename.lastIndexOf('.'))
      const fileNameWithoutExtension = filename.substring(
        0,
        filename.lastIndexOf('.')
      )
      const uniqueFileName = `${fileNameWithoutExtension}_${timestamp}${fileExtension}`
      rawFile = bucket.file(`${project.name}/raw/` + uniqueFileName)
    }

    const [url] = await rawFile.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos de validade
      contentType: req.body.contentType,
    })

    return res.json({ url })
  }
)

export default router
