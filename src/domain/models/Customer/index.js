import mongoose from 'mongoose'
import { customerConfig } from './customerConfig'

const customerSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    taxId: {
      type: String,
      required: true,
    },
    corporateName: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zip: String,
    },
    status: {
      type: String,
      enum: [customerConfig.status.ACTIVE, customerConfig.status.INACTIVE],
      default: customerConfig.status.ACTIVE,
    },
  },
  { timestamps: true, collection: customerConfig.modelName, versionKey: false }
)

export const Customer = mongoose.model(customerConfig.modelName, customerSchema)
