import HttpException from '#src/domain/exceptions/HttpException'
import imageRepository from '#src/infra/repositories/image'
import projectRepository from '#src/infra/repositories/project'
import auth from '#src/middlewares/auth'
import getIssuer from '#src/utils/request/getIssuer'
import express from 'express'
const router = express.Router()

router.get('/images/:id/relatives', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const [referenceImage, currentAuthProject] = await Promise.all([
    imageRepository.getById(req.params.id),
    projectRepository.getByOrgId(issuer.organizationId),
  ])
  if (!referenceImage) {
    throw new HttpException(404, 'Image not found')
  }

  if (referenceImage.project !== currentAuthProject.name) {
    throw new HttpException(404, 'Image not found in project')
  }

  const relativeImages = await imageRepository.getRelativeImages(
    referenceImage,
    currentAuthProject
  )

  return res.json(relativeImages)
})

export default router
