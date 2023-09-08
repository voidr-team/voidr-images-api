import HttpException from '#src/domain/exceptions/HttpException'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import express from 'express'
const router = express.Router()

router.get('/organization/members', async (req, res) => {
  const orgId = req.issuer.organizationId

  const auth0Management = await auth0ManagementFactory()

  const members = await auth0Management.getOrganizationMembersWithRoles(orgId)

  const mappedMembers = members.map(({ user_id, ...member }) => ({
    sub: user_id,
    ...member,
  }))

  return res.json(mappedMembers)
})

router.delete('/organization/members/:sub', async (req, res) => {
  const sub = req.params.sub
  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }
  const orgId = req.issuer.organizationId
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMembers(orgId, [sub])
  return res.json({ modified: true })
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

  const orgId = req.issuer.organizationId
  const auth0Management = await auth0ManagementFactory()

  await auth0Management.addRolesInMember(orgId, sub, roles)
  return res.send({ modified: true })
})

router.put('/organization/members/:sub/roles', async (req, res) => {
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }

  if (!req.body.role) {
    throw HttpException(422, 'Missing role in body')
  }

  const orgId = req.issuer.organizationId
  const auth0Management = await auth0ManagementFactory()

  const rolesResponse = auth0Management.getRoles()

  const roles = rolesResponse?.data?.map((role) => role.id)

  await auth0Management.removeOrganizationMemberRoles(orgId, sub, roles)

  await auth0Management.addRolesInMember(orgId, sub, roles)

  return res.json({ modified: true })
})

router.delete('/organization/members/:sub/roles', async (req, res) => {
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'Missing member sub param')
  }

  if (!req.body.role) {
    throw HttpException(422, 'Missing role in body')
  }

  const orgId = req.issuer.organizationId
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMemberRoles(orgId, sub, [
    req.body.role,
  ])

  return res.json({ modified: true })
})

export default router
