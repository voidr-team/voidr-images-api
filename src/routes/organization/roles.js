import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import auth from '#src/middlewares/auth'
import express from 'express'
const router = express.Router()

router.get('/organization/roles', auth, async (req, res) => {
  const auth0Management = await auth0ManagementFactory()
  const roles = await auth0Management.getRoles()
  return res.json(roles.data)
})

export default router
