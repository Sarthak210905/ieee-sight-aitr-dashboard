import mongoose, { Schema, model, models } from 'mongoose'

export interface IProgress {
  _id?: string
  month: string
  year: number
  events: number
  members: number
  documents: number
  target: number
}

const ProgressSchema = new Schema<IProgress>({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  events: { type: Number, default: 0 },
  members: { type: Number, default: 0 },
  documents: { type: Number, default: 0 },
  target: { type: Number, default: 5 },
}, {
  timestamps: true,
})

ProgressSchema.index({ year: -1, month: -1 })

export const Progress = models.Progress || model<IProgress>('Progress', ProgressSchema)
