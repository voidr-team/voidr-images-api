import HttpException from '#src/domain/exceptions/HttpException'
import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { createVendorSchema } from './schema'
const router = express.Router()

router.post('/vendor', validateSchema(createVendorSchema), async (req, res) => {
  return res.json({})
})
