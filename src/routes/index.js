import express from 'express'
import accountRoutes from './account'
import customerRoutes from './customer'
import paymentBatchRoutes from './payments/batch'
const router = express.Router()

export default [router, accountRoutes, customerRoutes, paymentBatchRoutes]
