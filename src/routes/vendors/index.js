import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { createVendorSchema, patchStatusVendorSchema } from './schema'
import vendorRepository from '#src/infra/repositories/vendor'
import vendorService from '#src/domain/services/vendor'
import getIssuer from '#src/utils/request/getIssuer'
const router = express.Router()

router.post(
  '/vendors',
  validateSchema(createVendorSchema),
  async (req, res) => {
    const issuer = getIssuer(req)
    const body = req.body

    const createdVendor = await vendorService.createVendor(issuer, {
      name: body.name,
      website: body.website,
      contract: body.contract,
      contact: body.contact,
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
    const issuer = getIssuer(req)

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
  const issuer = getIssuer(req)
  const vendors = await vendorRepository.list(issuer)
  return res.json(vendors)
})

export default router
