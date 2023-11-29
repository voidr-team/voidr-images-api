import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import auth from '#src/middlewares/auth'
import imageRepository from '#src/infra/repositories/image'
import HttpException from '#src/domain/exceptions/HttpException'
const router = express.Router()

router.get('/dashboard', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  if (!project) {
    throw new HttpException(404, 'Project not found')
  }
  const [imagesPerDay, bytesSaved, usage] = await Promise.all([
    imageRepository.countPerDay(project.name),
    imageRepository.bytesSaved(project.name),
    imageRepository.countByProject(project.name),
  ])

  return res.json({
    imagesPerDay,
    bytesSaved,
    usage,
  })
})

export default router
