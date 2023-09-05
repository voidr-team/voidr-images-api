import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { createVendorSchema, patchStatusVendorSchema } from './schema'
import vendorRepository from '#src/infra/repositories/vendor'
const router = express.Router()

router.post(
  '/vendors',
  validateSchema(createVendorSchema),
  async (req, res) => {
    const issuer = req.issuer
    const body = req.body

    const createdVendor = await vendorRepository.create(issuer, {
      name: body.name,
      website: body.website,
      contract: body.contract,
      contacts: body.contacts,
      categories: body.categories,
      interestTeam: body.interestTeam,
      organizationId: body.organizationId,
    })

    return res.json(createdVendor)
  }
)

router.patch(
  '/vendors/:vendorId/status',
  validateSchema(patchStatusVendorSchema),
  async (req, res) => {
    const issuer = req.issuer

    const status = req.body.status

    const vendorId = req.params.vendorId

    const updatedVendor = await vendorRepository.updateStatus(
      issuer,
      vendorId,
      status
    )

    return res.json(updatedVendor)
  }
)

router.get('/vendors', async (req, res) => {
  const vendors = await vendorRepository.list(req.issuer)
  return res.json(vendors)
})

export default router
