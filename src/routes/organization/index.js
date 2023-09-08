import HttpException from '#src/domain/exceptions/HttpException'
import express from 'express'
const router = express.Router()
import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import organizationService from '#src/domain/services/organization'
import organizationMembers from './members'
import organizationInvites from './invites'
import organizationRoles from './roles'
import validateSchema from '#src/middlewares/validateSchema'
import { createOrganizationSchema } from './schema'

router.post(
  '/organization',
  validateSchema(createOrganizationSchema),
  async (req, res) => {
    const auth0Management = await auth0ManagementFactory()
    const body = req.body

    /** @type {Issuer}  */
    const issuer = req.issuer

    const organizationResponse = await auth0Management.createOrganization({
      name: body.name,
      displayName: body.displayName,
      branding: {
        logoUrl: body.logo,
      },
    })

    const organization = organizationResponse?.data

    await auth0Management.addMembersToOrganization(organization.id, [
      issuer.sub,
    ])

    return res.json({
      name: organization.name,
      id: organization.id,
      displayName: organization.display_name,
      branding: {
        logoUrl: organization.branding?.logo_url,
      },
    })
  }
)

router.get('/organization-by-name', async (req, res) => {
  const name = req.query.name
  if (!name) throw new HttpException(422, 'Missing query "name"')

  if (name.length < 4)
    throw new HttpException(
      422,
      'Query "name" should have at least 4 characters'
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
