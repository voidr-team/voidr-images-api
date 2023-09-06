import mongoose from 'mongoose'
import { accountConfig } from './accountConfig'
import { customerConfig } from '../Customer/customerConfig'

const accountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
    },
    accountDescription: {
      type: String,
    },
    clientId: {
      type: String,
      required: true,
      unique: true,
    },
    clientSecret: {
      type: String,
      required: true,
      select: false, // use Account.find(...).select('+clientSecret').exec to get clientSecret
    },
    authenticationMethod: {
      type: String,
      required: true,
      default: accountConfig.authenticationMethod.BASIC,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: customerConfig.modelName,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: accountConfig.modelName,
    versionKey: false,
  }
)

export const Account = mongoose.model(accountConfig.modelName, accountSchema)
