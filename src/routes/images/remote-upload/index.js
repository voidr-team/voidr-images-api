import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { createVendorSchema, patchStatusVendorSchema } from './schema'
import vendorRepository from '#src/infra/repositories/vendor'
import vendorService from '#src/domain/services/vendor'
import getIssuer from '#src/utils/request/getIssuer'
const router = express.Router()
