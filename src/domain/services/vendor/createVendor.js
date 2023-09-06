import { vendorSchema } from '#src/domain/models/Vendor'
import vendorRepository from '#src/infra/repositories/vendor'
import organizationService from '../organization'

/**
 * @param {Issuer} issuer
 * @param {vendorSchema} vendorData
 */
const createVendor = async (issuer, vendorData) => {
  const vendor = await vendorRepository.create(issuer, vendorData)

  if (vendor.organizationId) {
    return vendor
  }

  const existedOrganization = await organizationService.searchOrganization(
    vendorData.name,
    {
      exactMatch: true,
    }
  )

  let vendorOrganizationId = existedOrganization?.id

  if (!vendorOrganizationId) {
    const auth0Org = await organizationService.createOrganization()
    vendorOrganizationId = auth0Org.id
  }

  const vendorWithOrgId = await vendorRepository.updateOrganizationId(
    vendor._id,
    vendorOrganizationId
  )

  return vendorWithOrgId
}

export default createVendor
