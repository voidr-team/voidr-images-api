import express from 'express'
import accountRoutes from './account'
import customerRoutes from './customer'
import paymentBatchRoutes from './payments/batch'
const router = express.Router()

router.get('/health', async (req, res) => {
  return res.send('ok')
})

export default [router, accountRoutes, customerRoutes, paymentBatchRoutes]
