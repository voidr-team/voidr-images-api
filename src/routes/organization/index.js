import HttpException from '#src/domain/exceptions/HttpException'
import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { inviteSchema } from './schema'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import organizationService from '#src/domain/organization'
const router = express.Router()

router.get('/organization/members', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const auth0Management = await auth0ManagementFactory()
  const members = await auth0Management.getOrganizationMembersWithRoles(orgId)
  const mappedMembers = members.map(({ user_id, ...member }) => ({
    sub: user_id,
    ...member,
  }))
  return res.json(mappedMembers)
})

router.get('/organization/invites', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const auth0Management = await auth0ManagementFactory()
  const invitations = await auth0Management.getInvitations(orgId)
  const toCamelCase = (invite) => ({
    ...invite,
    connectionId: invite.connection_id,
    clientId: invite.client_id,
    invitationUrl: invite.invitation_url,
    ticketId: invite.ticket_id,
    createdAt: invite.created_at,
    expiresAt: invite.expires_at,
    organizationId: invite.organization_id,
  })
  const mappedInvitations = invitations.data.map(toCamelCase)

  return res.json(mappedInvitations)
})

router.post(
  '/organization/invites',
  validateSchema(inviteSchema),
  async (req, res) => {
    const { user, org_id } = req.auth.payload
    const { email, roles, name } = req.body

    const auth0Management = await auth0ManagementFactory()

    await auth0Management.createInvite(org_id, {
      inviterName: user.name,
      inviteeEmail: email,
      roles: roles,
      inviteeName: name,
    })

    return res.json({ modified: true })
  }
)

router.delete('/organization/invites/:inviteId', async (req, res) => {
  const orgId = req.auth.payload.org_id
  const inviteId = req.params.inviteId

  if (!inviteId) {
    throw new HttpException(422, 'Missing inviteId param')
  }

  const auth0Management = await auth0ManagementFactory()

  await auth0Management.deleteInvite(orgId, inviteId)

  return res.json({ modified: true })
})

router.delete('/organization/members/:sub', async (req, res) => {
  const sub = req.params.sub
  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }
  const orgId = req.auth.payload.org_id
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMembers(orgId, [sub])
  return res.json({ modified: true })
})

router.get('/organization/roles', async (req, res) => {
  const auth0Management = await auth0ManagementFactory()
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
  const auth0Management = await auth0ManagementFactory()

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
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMemberRoles(orgId, sub, [
    req.body.role,
  ])

  return res.json({ modified: true })
})

router.get('/organization-by-name', async (req, res) => {
  const name = req.query.name
  if (!name) {
    throw new HttpException(422, 'Missing query "name"')
  }

  const organization = await organizationService.searchOrganization(name)

  if (!organization) {
    throw new HttpException(404, 'Organization not found')
  }

  return res.json(organization)
})

export default router
