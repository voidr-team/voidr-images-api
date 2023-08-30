import { BatchPayment } from '#src/infra/models/BatchPayment'
import { Payment } from '#src/infra/models/Payment'
import StarkBank from '#src/infra/providers/StarkBank'
import defaultProject from '#src/infra/providers/StarkBank/defaultProject'
import mongoose from 'mongoose'

const createBatchPayment = async (account, payments, payer) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  const orZero = (payment, property) => payment[property] || 0

  const getPaymentTotalAmount = (payment) =>
    orZero(payment, 'amount') +
    orZero(payment, 'nominalAmount') +
    orZero(payment, 'fineAmount') +
    orZero(payment, 'interestAmount')

  try {
    const totalAmount = payments.reduce(
      (acc, payment) => acc + getPaymentTotalAmount(payment),
      0
    )
    const batchPayment = new BatchPayment({
      account: account._id,
      totalAmount,
      payer,
    })

    await batchPayment.save({ session })

    const paymentDocs = payments.map((payment) => ({
      batchPayment: batchPayment._id,
      account: account._id,
      raw: payment,
      method: payment.method,
      amount: getPaymentTotalAmount(payment),
    }))

    await Payment.insertMany(paymentDocs, { session })

    await session.commitTransaction()
    session.endSession()

    return batchPayment
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

/**
 *
 * @param {BatchPayment} batchPayment
 */
const createInvoiceOfBatchPayment = async (batchPayment) => {
  const starkBank = new StarkBank(defaultProject)
  const { totalAmount } = batchPayment

  const invoice = await starkBank.createInvoice({
    amount: totalAmount,
    taxId: batchPayment.payer.taxId,
    name: batchPayment.payer.taxId,
    tags: [`batch_${batchPayment._id}`],
    descriptions: [
      { key: `Pagamento do lote: ${batchPayment._id}`, value: ' ' },
    ],
    fine: 0,
    interest: 0,
  })

  const qrcode = await starkBank.getQRCode(invoice.id)

  batchPayment.invoice = { ...invoice, qrcode }
  return await batchPayment.save()
}

export default {
  createBatchPayment,
  createInvoiceOfBatchPayment,
}
