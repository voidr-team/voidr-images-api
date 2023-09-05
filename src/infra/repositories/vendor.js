import { Vendor, vendorSchema } from '#models/Vendor'

/**
 * @param {Issuer} issuer
 * @param {string} vendorId
 * @param {string} newStatus
 */
const updateStatus = async (issuer, vendorId, newStatus) => {
  return await Vendor.findOneAndUpdate(
    {
      'createdBy.organizationId': issuer.organizationId,
      _id: vendorId,
    },
    { status: newStatus },
    { new: true }
  ).exec()
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
  return await newVendor.save()
}

/** @param {Issuer} issuer */
const list = async (issuer) => {
  return await Vendor.find({
    'createdBy.organizationId': issuer.organizationId,
  }).exec()
}

const vendorRepository = { updateStatus, create, list }
export default vendorRepository
