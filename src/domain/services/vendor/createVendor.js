import HttpException from '#src/domain/exceptions/HttpException'
import { VendorSchema } from '#models/Vendor'
import vendorRepository from '#src/infra/repositories/vendor'
import organizationService from '../organization'

/**
 * @param {Issuer} issuer
 * @param {VendorSchema} vendorData
 */
const createVendor = async (issuer, vendorData) => {
  if (issuer.organizationId === vendorData.organizationId) {
    throw new HttpException(
      422,
      'Organization id is equals to users organization id'
    )
  }
  if (vendorData.organizationId) {
    const vendor = await vendorRepository.create(issuer, vendorData)
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
    const auth0Org = await organizationService.createOrganization({
      name: vendorData.name,
      displayName: vendorData.name,
    })
    vendorOrganizationId = auth0Org.id
  }

  if (vendorOrganizationId === issuer.organizationId) {
    throw new HttpException(
      422,
      'Organization id is equals to users organization id'
    )
  }

  const vendorWithOrgId = await vendorRepository.create(issuer, {
    ...vendorData,
    organizationId: vendorOrganizationId,
  })

  return vendorWithOrgId
}

export default createVendor
