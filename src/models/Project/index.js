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
      domains: [
        {
          type: String,
          required: true,
        },
      ],
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
    },
    {
      timestamps: true,
      collection: projectConfig.modelName,
      versionKey: false,
    }
  )
)

export const ProjectSchema = Project.schema.obj
