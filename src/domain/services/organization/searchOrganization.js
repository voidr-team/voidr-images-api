import auth0ManagementFactory from '#src/infra/providers/Auth0Management/factory'
import { toLower } from 'ramda'

const searchByName = async ({ lowerCaseName, auth0Management }) => {
  const organizationByNameResponse =
    await auth0Management.getOrganizationByName(lowerCaseName)
  const organizationByName = organizationByNameResponse?.data

  if (organizationByName) {
    return organizationByName
  }

  return null
}

const searchInList = async ({ lowerCaseName, auth0Management }) => {
  const searchInEntireList = async (from = null) => {
    const organizationsList = await auth0Management.getOrganizations({
      from,
    })

    const { organizations = [], next = null } = organizationsList?.data || {}

    const organizationFound = organizations.find(({ name, display_name }) => {
      const orgName = toLower(name)
      const displayName = toLower(display_name)
      return (
        orgName.includes(lowerCaseName) || displayName.includes(lowerCaseName)
      )
    })

    if (organizationFound) return organizationFound

    if (!next) {
      return null
    }

    return await searchInEntireList(next)
  }

  return await searchInEntireList()
}

/**
 * @param {string} name
 * @param {{exactMatch: boolean}} options
 */
const searchOrganization = async (name, options = { exactMatch: false }) => {
  const lowerCaseName = toLower(name)
  const auth0Management = await auth0ManagementFactory()

  let organization = await searchByName({ lowerCaseName, auth0Management })
  if (!organization && !options.exactMatch) {
    organization = await searchInList({ lowerCaseName, auth0Management })
  }
  return organization
}

export default searchOrganization
