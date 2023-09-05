import express from 'express'
import accountRoutes from './account'
import customerRoutes from './customer'
import paymentBatchRoutes from './payments/batch'
import userRoutes from './user'
import organizationRoutes from './organization'
import vendorRoutes from './vendors'
const router = express.Router()

export default [
  router,
  userRoutes,
  accountRoutes,
  customerRoutes,
  paymentBatchRoutes,
  organizationRoutes,
  vendorRoutes,
]
