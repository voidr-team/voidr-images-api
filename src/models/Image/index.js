import mongoose from 'mongoose'
import { imageConfig } from './imageConfig'

export const Image = mongoose.model(
  imageConfig.modelName,
  new mongoose.Schema(
    {
      remote: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      project: {
        type: String,
        required: true,
      },
      originUrl: {
        type: String,
        required: true,
      },
      bucketFile: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        enum: Object.values(imageConfig.status),
        default: imageConfig.status.PENDING,
        required: true,
      },
      metadata: Object,
      rawMetadata: Object,
      transformers: Object,
      transformPipeline: [String],
      task: String,
    },
    {
      timestamps: true,
      collection: imageConfig.modelName,
      versionKey: false,
    }
  )
)

export const ImageSchema = Image.schema.obj
