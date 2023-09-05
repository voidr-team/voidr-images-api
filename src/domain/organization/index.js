import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import { toLower } from 'ramda'

/** @param {string} name */
const searchOrganization = async (name) => {
  const lowerCaseName = toLower(name)
  const auth0Management = await auth0ManagementFactory()
  const organizationByNameResponse =
    await auth0Management.getOrganizationByName(name)
  const organizationByName = organizationByNameResponse?.data

  if (organizationByName) {
    return organizationByName
  }

  const searchInEntireList = async (from = null) => {
    const organizationsList = await auth0Management.getOrganizations({
      from,
    })

    const { organizations = [], next = null } = organizationsList?.data || {}

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

const organizationService = {
  searchOrganization,
}
export default organizationService
