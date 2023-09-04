import HttpException from '#src/domain/exceptions/HttpException'
import Auth0Management from '#src/infra/providers/Auth0Managment'
import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import inviteSchema from './schema'
const router = express.Router()

router.get('/organization/members', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  const members = await auth0Management.getOrganizationMembersWithRoles(orgId)
  return res.json(members)
})

router.get('/organization/invites', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  const invitations = await auth0Management.getInvitations(orgId)
  return res.json(invitations.data)
})

router.post(
  '/organization/invite',
  validateSchema(inviteSchema),
  async (req, res) => {
    const { user, org_id } = req.auth.payload
    const { email, roles, name } = req.body

    const accessToken = await Auth0Management.getAccessToken()

    const auth0Management = new Auth0Management(accessToken)

    await auth0Management.createInvite(org_id, {
      inviterName: user.name,
      inviteeEmail: email,
      roles: roles,
      inviteeName: name,
    })

    return res.json({ modified: true })
  }
)

router.delete('/organization/members/:sub', async (req, res) => {
  const sub = req.params.sub
  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }
  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  await auth0Management.removeOrganizationMembers(orgId, [sub])
  return res.json({ modified: true })
})

router.get('/organization/roles', async (req, res) => {
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  const roles = await auth0Management.getRoles()
  return res.json(roles.data)
})

router.post('/organization/members/:sub/roles', async (req, res) => {
  const roles = req.body.roles
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }

  if (!roles || !roles.length) {
    throw HttpException(422, 'Missing role in body')
  }

  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)

  await auth0Management.addRolesInMember(orgId, sub, roles)
  return res.send({ modified: true })
})

router.delete('/organization/members/:sub/role', async (req, res) => {
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }

  if (!req.body.role) {
    throw HttpException(422, 'Missing role in body')
  }

  const orgId = req.auth.payload.org_id
  const accessToken = await Auth0Management.getAccessToken()
  const auth0Management = new Auth0Management(accessToken)
  await auth0Management.removeOrganizationMemberRoles(orgId, sub, [
    req.body.role,
  ])

  return res.json({ modified: true })
})

export default router
