import HttpException from '#src/domain/exceptions/HttpException'
import express from 'express'
const router = express.Router()
import organizationService from '#src/domain/services/organization'
import organizationMembers from './members'
import organizationInvites from './invites'
import organizationRoles from './roles'
import auth from '#src/middlewares/auth'

router.get('/organization-by-name', auth, async (req, res) => {
  const name = req.query.name
  if (!name) throw new HttpException(422, 'missing query "name"')

  if (name.length < 4)
    throw new HttpException(
      422,
      'query "name" should have at least 4 characters'
    )

  const organization = await organizationService.searchOrganization(name)

  if (!organization) throw new HttpException(404, 'Organization not found')

  const { display_name, branding, ...rest } = organization
  const { logo_url, ...brand } = branding || {}

  return res.json({
    ...rest,
    displayName: display_name,
    branding: {
      ...brand,
      logoUrl: logo_url,
    },
  })
})

export default [
  router,
  organizationMembers,
  organizationInvites,
  organizationRoles,
]
