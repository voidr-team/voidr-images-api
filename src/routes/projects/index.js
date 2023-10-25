import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import HttpException from '#src/domain/exceptions/HttpException'
import { projectConfig } from '#src/models/Project/projectConfig'
import { createProjectSchema } from './schema'
import auth from '#src/middlewares/auth'
const router = express.Router()

router.post(
  '/projects',
  auth,
  validateSchema(createProjectSchema),
  async (req, res) => {
    const issuer = getIssuer(req)
    const body = req.body

    if (await projectRepository.exists(body.name)) {
      throw new HttpException(
        422,
        `project with name "${body.name}" already exists`
      )
    }

    const createdProject = await projectRepository.create(issuer, {
      name: body.name,
      bucket: {
        source: projectConfig.bucketSource.VOIDR,
        name: body.name,
      },
      domains: body.domains,
    })

    return res.json(createdProject)
  }
)

router.get('/projects', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const projects = await projectRepository.list(issuer)
  return res.json(projects)
})

export default router
