import validateSchema from '#src/middlewares/validateSchema'
import express from 'express'
import { batchPaymentSchema } from './schemas'

import batchPaymentsService from '#src/domain/payments/batchPaymentsService'
const router = express.Router()

router.post(
  '/payments/batch',
  validateSchema(batchPaymentSchema),
  async (req, res) => {
    const body = req.body
    const account = req.user
    const batchPayment = await batchPaymentsService.createBatchPayment(
      account,
      body.payments,
      body.payer
    )
    const batchPaymentWithInvoice =
      await batchPaymentsService.createInvoiceOfBatchPayment(batchPayment)
    res.status(201).json(batchPaymentWithInvoice)
  }
)

export default router
