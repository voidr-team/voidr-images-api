import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import { toLower } from 'ramda'

const searchOrganization = async (name) => {
  const lowerCaseName = toLower(name)
  const auth0Management = await auth0ManagementFactory()
  const organizationByName = await auth0Management.getOrganizationByName(name)
  if (organizationByName) {
    return organizationByName
  }

  const searchInEntireList = async (from = null) => {
    const organizationsList = await auth0Management.getOrganizations({
      from,
    })

    const { organizations, next } = organizationsList

    const organizationFound = organizations.find(({ name, display_name }) => {
      const orgName = toLower(name)
      const displayName = toLower(display_name)
      return orgName === lowerCaseName || displayName === lowerCaseName
    })

    if (organizationFound) return organizationFound

    if (!next) {
      return null
    }

    return await searchInEntireList(next)
  }

  return await searchInEntireList()
}

export default {
  searchOrganization,
}
