import express from 'express'
import accountRoutes from './account'
import customerRoutes from './customer'
import paymentBatchRoutes from './payments/batch'
import userRoutes from './user'
const router = express.Router()

export default [
  router,
  userRoutes,
  accountRoutes,
  customerRoutes,
  paymentBatchRoutes,
]
