import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import slug from '#src/utils/transform/slug'

const createOrganization = async ({ name }) => {
  const auth0Management = await auth0ManagementFactory()

  const createOrgResponse = await auth0Management.createOrganization({
    name: slug(name),
    display_name: name,
  })

  return createOrgResponse.data
}

export default createOrganization
