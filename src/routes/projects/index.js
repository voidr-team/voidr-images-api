import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import getIssuer from '#src/utils/request/getIssuer'
import projectRepository from '#src/infra/repositories/project'
import HttpException from '#src/domain/exceptions/HttpException'
import { projectConfig } from '#src/models/Project/projectConfig'
import { createProjectSchema, updateProjectDomainsSchema } from './schema'
import auth from '#src/middlewares/auth'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
const router = express.Router()

router.get('/projects', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  return res.json(project)
})

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

    const auth0Management = await auth0ManagementFactory()

    const organizationResponse = await auth0Management.createOrganization({
      name: body.name,
      displayName: body.name,
    })

    const organization = organizationResponse?.data

    await auth0Management.addMembersToOrganization(organization.id, [
      issuer.sub,
    ])

    const createdProject = await projectRepository.create(
      {
        organizationId: organization.id,
        sub: issuer.sub,
      },
      {
        name: body.name,
        bucket: {
          source: projectConfig.bucketSource.VOIDR,
          name: 'voidr',
        },
        domains: body.domains,
        members: [issuer.sub],
      }
    )

    return res.json(createdProject)
  }
)

router.post('/projects/join', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const project = await projectRepository.getByOrgId(issuer.organizationId)
  if (project.members.includes(issuer.sub)) {
    return res.status(200).send()
  }
  await projectRepository.addMember(project._id, issuer.sub)
  return res.status(201).send()
})

router.get('/projects', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const projects = await projectRepository.list(issuer)
  return res.json(projects)
})

router.put(
  '/projects/domains',
  auth,
  validateSchema(updateProjectDomainsSchema),
  async (req, res) => {
    const issuer = getIssuer(req)
    const updatedProject = await projectRepository.updateDomains(
      issuer,
      req.body.domains
    )
    return res.json(updatedProject)
  }
)

export default router
