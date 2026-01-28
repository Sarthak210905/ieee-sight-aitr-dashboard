import mongoose, { Schema, model, models } from 'mongoose'

export interface IAchievementSubmission {
  _id?: string
  memberId: string
  memberName: string
  memberEmail: string
  title: string
  description: string
  category: 'event' | 'contribution' | 'leadership' | 'excellence'
  proof?: string // URL or description of proof
  points: number // Points to be awarded if approved
  status: 'pending' | 'approved' | 'rejected'
  adminComment?: string
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

const AchievementSubmissionSchema = new Schema<IAchievementSubmission>({
  memberId: { type: String, required: true },
  memberName: { type: String, required: true },
  memberEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['event', 'contribution', 'leadership', 'excellence'], 
    required: true 
  },
  proof: { type: String },
  points: { type: Number, required: true, default: 10 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminComment: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
}, {
  timestamps: true,
})

AchievementSubmissionSchema.index({ status: 1 })
AchievementSubmissionSchema.index({ memberId: 1 })
AchievementSubmissionSchema.index({ submittedAt: -1 })

export const AchievementSubmission = models.AchievementSubmission || model<IAchievementSubmission>('AchievementSubmission', AchievementSubmissionSchema)
