import HttpException from '#src/domain/exceptions/HttpException'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { inviteSchema } from './schema'
import getIssuer from '#src/utils/request/getIssuer'
import auth from '#src/middlewares/auth'
const router = express.Router()

router.use(auth)

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
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId
  const inviteId = req.params.inviteId

  if (!inviteId) {
    throw new HttpException(422, 'missing inviteId param')
  }

  const auth0Management = await auth0ManagementFactory()

  await auth0Management.deleteInvite(orgId, inviteId)

  return res.json({ modified: true })
})

router.get('/organization/invites', async (req, res) => {
  const orgId = getIssuer(req).organizationId

  const auth0Management = await auth0ManagementFactory()

  const invitations = await auth0Management.getInvitations(orgId)

  const toCamelCase = ({
    connection_id,
    client_id,
    invitation_url,
    ticket_id,
    created_at,
    expires_at,
    organization_id,
    ...invite
  }) => ({
    ...invite,
    connectionId: connection_id,
    clientId: client_id,
    invitationUrl: invitation_url,
    ticketId: ticket_id,
    createdAt: created_at,
    expiresAt: expires_at,
    organizationId: organization_id,
  })
  const mappedInvitations = invitations.data.map(toCamelCase)

  return res.json(mappedInvitations)
})

export default router
