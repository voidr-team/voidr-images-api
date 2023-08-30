import mongoose from 'mongoose'
import { batchPaymentConfig } from './batchPaymentConfig'
import { accountConfig } from '../Account/accountConfig'

const batchPaymentSchema = new mongoose.Schema(
  {
    processedAt: Date,
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        batchPaymentConfig.status.PENDING,
        batchPaymentConfig.status.PROCESSING,
        batchPaymentConfig.status.PROCESSED,
        batchPaymentConfig.status.FAILED,
      ],
      default: batchPaymentConfig.status.PENDING,
    },
    payer: {
      required: true,
      type: {
        taxId: { type: String, required: true },
        name: { type: String, required: true },
      },
    },
    invoice: mongoose.Schema.Types.Mixed,
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: accountConfig.modelName,
    },
  },
  {
    timestamps: true,
    collection: batchPaymentConfig.modelName,
    versionKey: false,
  }
)

export const BatchPayment = mongoose.model(
  batchPaymentConfig.modelName,
  batchPaymentSchema
)
