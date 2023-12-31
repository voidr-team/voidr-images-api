import HttpException from '#src/domain/exceptions/HttpException'
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import auth from '#src/middlewares/auth'
import getIssuer from '#src/utils/request/getIssuer'
import express from 'express'
const router = express.Router()

router.get('/organization/members', auth, async (req, res) => {
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId

  const auth0Management = await auth0ManagementFactory()

  const members = await auth0Management.getOrganizationMembersWithRoles(orgId)

  const mappedMembers = members
    .map(({ user_id, ...member }) => ({
      sub: user_id,
      ...member,
    }))
    .filter((member) => !member.email.includes('@voidr.co'))

  return res.json(mappedMembers)
})

router.delete('/organization/members/:sub', auth, async (req, res) => {
  const sub = req.params.sub
  if (!req.params.sub) {
    throw HttpException(422, 'missing member sub param')
  }
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMembers(orgId, [sub])
  return res.json({ modified: true })
})

router.post('/organization/members/:sub/roles', async (req, res) => {
  const roles = req.body.roles
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'missing member sub param')
  }

  if (!roles || !roles.length) {
    throw HttpException(422, 'missing role in body')
  }
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId
  const auth0Management = await auth0ManagementFactory()

  await auth0Management.addRolesInMember(orgId, sub, roles)
  return res.send({ modified: true })
})

router.put('/organization/members/:sub/roles', auth, async (req, res) => {
  const sub = req.params.sub

  if (!req.params.sub) {
    throw new HttpException(422, 'missing member sub param')
  }

  if (!req.body.role) {
    throw new HttpException(422, 'missing role in body')
  }
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId
  const auth0Management = await auth0ManagementFactory()

  const rolesResponse = await auth0Management.getRoles()

  const roleBody = req.body.role

  const roles = rolesResponse?.data?.map((role) => role.id)

  await auth0Management.removeOrganizationMemberRoles(orgId, sub, roles)

  await auth0Management.addRolesInMember(orgId, sub, roleBody)

  return res.json({ modified: true })
})

router.delete('/organization/members/:sub/roles', auth, async (req, res) => {
  const sub = req.params.sub

  if (!req.params.sub) {
    throw HttpException(422, 'missing member sub param')
  }

  if (!req.body.role) {
    throw HttpException(422, 'missing role in body')
  }
  const issuer = getIssuer(req)
  const orgId = issuer.organizationId
  const auth0Management = await auth0ManagementFactory()
  await auth0Management.removeOrganizationMemberRoles(orgId, sub, [
    req.body.role,
  ])

  return res.json({ modified: true })
})

export default router
