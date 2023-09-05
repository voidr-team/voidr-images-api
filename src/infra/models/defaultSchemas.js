import mongoose from 'mongoose'

export const CreatedBySchema = new mongoose.Schema(
  {
    sub: { type: String, required: true },
    organizationId: { type: String, required: true },
  },
  {
    _id: false,
  }
)
