import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import express from 'express'
const router = express.Router()

router.get('/organization/roles', async (req, res) => {
  const auth0Management = await auth0ManagementFactory()
  const roles = await auth0Management.getRoles()
  return res.json(roles.data)
})

export default router
