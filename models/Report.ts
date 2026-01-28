import mongoose, { Schema, model, models } from 'mongoose'

export interface IReport {
  _id?: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  type: 'bug' | 'issue' | 'suggestion' | 'complaint' | 'other'
  subject: string
  description: string
  relatedTo?: string // Can be achievement ID, event ID, etc.
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  adminResponse?: string
  createdAt: Date
  resolvedAt?: Date
}

const ReportSchema = new Schema<IReport>({
  reporterId: { type: String, required: true },
  reporterName: { type: String, required: true },
  reporterEmail: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['bug', 'issue', 'suggestion', 'complaint', 'other'],
    required: true 
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  relatedTo: { type: String },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium' 
  },
  adminResponse: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
}, {
  timestamps: true,
})

ReportSchema.index({ status: 1 })
ReportSchema.index({ reporterId: 1 })
ReportSchema.index({ createdAt: -1 })

export const Report = models.Report || model<IReport>('Report', ReportSchema)
