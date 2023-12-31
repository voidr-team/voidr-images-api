import mongoose from 'mongoose'
import { projectConfig } from './projectConfig'
import { CreatedBySchema } from '../defaultSchemas'

export const Project = mongoose.model(
  projectConfig.modelName,
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      referral: {
        type: String,
        trim: true,
        default: null,
      },
      domains: [
        {
          type: String,
          required: true,
        },
      ],
      members: [{ type: String, required: true }],
      bucket: {
        source: {
          type: String,
          enum: Object.values(projectConfig.bucketSource),
          default: projectConfig.bucketSource.VOIDR,
          required: true,
        },
        name: String,
        credentials: {
          type: Object,
          select: false,
        },
      },
      createdBy: {
        type: CreatedBySchema,
        required: true,
      },
      plan: {
        type: String,
        enum: Object.values(projectConfig.plans),
        default: projectConfig.plans.FREE,
        required: true,
      },
      subscription: String,
      customer: String,
      freePlan: {
        expired: {
          type: Boolean,
          required: true,
          default: false,
        },
        usageLimit: {
          type: Number,
          required: true,
          default: 1000,
        },
      },
      metadata: {
        cadenceEmailSent: {
          type: [String],
          required: false,
          default: [],
        },
        nextSend: {
          date: {
            type: Date,
          },
          emailLabel: {
            type: String,
          },
        },
      },
    },
    {
      timestamps: true,
      collection: projectConfig.modelName,
      versionKey: false,
    }
  )
)

export const ProjectSchema = Project.schema.obj
