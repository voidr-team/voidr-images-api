import mongoose from 'mongoose'
import { vendorConfig } from './vendorConfig'
import { CreatedBySchema } from '../defaultSchemas'

export const vendorSchema = {
  website: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  contract: {
    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  interestTeam: {
    type: String,
    required: true,
  },
  contacts: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  organizationId: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: Object.values(vendorConfig.status),
    default: vendorConfig.status.ACTIVE,
    required: true,
  },
  createdBy: {
    type: CreatedBySchema,
    required: true,
  },
}

export const Vendor = mongoose.model(
  vendorConfig.modelName,
  new mongoose.Schema(vendorSchema, {
    timestamps: true,
    collection: vendorConfig.modelName,
    versionKey: false,
  })
)
