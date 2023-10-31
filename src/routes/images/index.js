import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import auth from '#src/middlewares/auth'
import imageRepository from '#src/infra/repositories/image'
const router = express.Router()

router.get('/images', auth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  const images = await imageRepository.paginate(project.name, page, limit)
  return res.json(images)
})

export default router
