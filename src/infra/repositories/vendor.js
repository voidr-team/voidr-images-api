import { Vendor, vendorSchema } from '#models/Vendor'

/**
 * @param {Issuer} issuer
 * @param {string} vendorId
 * @param {string} newStatus
 */
const updateStatus = async (issuer, vendorId, newStatus) => {
  const vendor = await Vendor.findOneAndUpdate(
    {
      'createdBy.organizationId': issuer.organizationId,
      _id: vendorId,
    },
    { status: newStatus },
    { new: true }
  ).exec()

  return vendor.toObject()
}

/**
 * @param {Issuer} issuer
 * @param {vendorSchema} raw
 */
const create = async (issuer, raw) => {
  const newVendor = new Vendor({
    ...raw,
    createdBy: {
      organizationId: issuer.organizationId,
      sub: issuer.sub,
    },
  })
  return (await newVendor.save()).toObject()
}

/** @param {Issuer} issuer */
const list = async (issuer) => {
  const vendors = await Vendor.find({
    'createdBy.organizationId': issuer.organizationId,
  }).exec()
  return vendors
}

/**
 * @param {string} id
 * @param {string} newOrganizationId
 */
const updateOrganizationId = async (id, newOrganizationId) => {
  const vendor = await Vendor.findByIdAndUpdate(
    id,
    {
      organizationId: newOrganizationId,
    },
    { new: true }
  ).exec()
  return vendor.toObject()
}

const vendorRepository = {
  updateStatus,
  create,
  list,
  updateOrganizationId,
}
export default vendorRepository
