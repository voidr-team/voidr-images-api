import Auth0Management from '#src/infra/providers/Auth0Managment'
import express from 'express'
const router = express.Router()

router.get('/organization/members', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  const members = await auth0Management.getOrganizationMembers(orgId)
  return res.json(members.data)
})

export default router
