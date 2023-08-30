import mongoose from 'mongoose'
import { paymentConfig } from './paymentConfig'
import { accountConfig } from '#models/Account/accountConfig'
import { batchPaymentConfig } from '#models/BatchPayment/batchPaymentConfig'

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    method: {
      type: String,
      enum: Object.values(paymentConfig.method),
      required: true,
    },
    status: {
      type: String,
      enum: [
        paymentConfig.status.PENDING,
        paymentConfig.status.PROCESSING,
        paymentConfig.status.PROCESSED,
        paymentConfig.status.FAILED,
      ],
      default: paymentConfig.status.PENDING,
    },
    raw: mongoose.Schema.Types.Mixed,
    batchPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: batchPaymentConfig.modelName,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: accountConfig.modelName,
    },
  },
  { timestamps: true, collection: paymentConfig.modelName, versionKey: false }
)

export const Payment = mongoose.model(paymentConfig.modelName, paymentSchema)
