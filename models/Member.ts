import mongoose, { Schema, model, models } from 'mongoose'

export interface IAchievement {
  id: string
  title: string
  description: string
  date: Date
  category: 'event' | 'contribution' | 'leadership' | 'excellence'
  icon: string
}

export interface IMember {
  _id?: string
  name: string
  email: string
  password?: string
  profileImage?: string
  bio?: string
  branch: string
  year: string
  eventsAttended: number
  contributions: number
  achievements: IAchievement[]
  points: number
  rank: number
  joinYear: number
  isActive: boolean
}

const AchievementSchema = new Schema<IAchievement>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, enum: ['event', 'contribution', 'leadership', 'excellence'], required: true },
  icon: { type: String, required: true },
}, { _id: false })

const MemberSchema = new Schema<IMember>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profileImage: { type: String },
  bio: { type: String },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  eventsAttended: { type: Number, default: 0 },
  contributions: { type: Number, default: 0 },
  achievements: [AchievementSchema],
  points: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  joinYear: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
})

MemberSchema.index({ points: -1 })
MemberSchema.index({ joinYear: -1 })
MemberSchema.index({ email: 1 })

export const Member = models.Member || model<IMember>('Member', MemberSchema)
