import mongoose, { Schema, model, models } from 'mongoose'

export interface IDocument {
  _id?: string
  name: string
  type: string
  uploadDate: Date
  size: string
  category: 'report' | 'document' | 'data'
  year: number
  driveFileId: string
  driveFileLink: string
  uploadedBy?: string
}

const DocumentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  size: { type: String, required: true },
  category: { type: String, enum: ['report', 'document', 'data'], required: true },
  year: { type: Number, required: true },
  driveFileId: { type: String, required: true },
  driveFileLink: { type: String, required: true },
  uploadedBy: { type: String },
}, {
  timestamps: true,
})

DocumentSchema.index({ year: -1, uploadDate: -1 })
DocumentSchema.index({ category: 1 })

export const Document = models.Document || model<IDocument>('Document', DocumentSchema)
