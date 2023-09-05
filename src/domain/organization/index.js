import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'

const searchOrganization = async () => {
  const auth0Management = await auth0ManagementFactory()
}

export default {
  searchOrganization,
}
