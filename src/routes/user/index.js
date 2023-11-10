import projectRepository from '#src/infra/repositories/project'
import auth from '#src/middlewares/auth'
import getIssuer from '#src/utils/request/getIssuer'
import express from 'express'
const router = express.Router()

router.get('/user/info', auth, async (req, res) => {
  const issuer = getIssuer(req)

  const payload = req.auth.payload

  const { organization, roles, sub, user } = payload

  const projects = await projectRepository.list(issuer)

  return res.json({
    organization,
    roles,
    sub,
    projects: projects.map((project) => ({
      id: project._id,
      name: project.name,
      organizationId: project.createdBy.organizationId,
      plan: project.plan,
      freePlanExpired: project.freePlan?.expired,
      usageLimit: project.freePlan?.usageLimit || 1000,
    })),
    ...user,
  })
})

export default router
