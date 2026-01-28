import mongoose, { Schema, model, models } from 'mongoose'

export interface IEvent {
  _id?: string
  title: string
  description: string
  date: Date
  endDate?: Date
  time?: string
  location: string
  type: 'workshop' | 'seminar' | 'meeting' | 'competition' | 'social' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  registrationLink?: string
  maxParticipants?: number
  currentParticipants: number
  organizer: string
  isPublic: boolean
  year: number
  createdBy?: string
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String },
  location: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['workshop', 'seminar', 'meeting', 'competition', 'social', 'other'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming' 
  },
  registrationLink: { type: String },
  maxParticipants: { type: Number },
  currentParticipants: { type: Number, default: 0 },
  organizer: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  year: { type: Number, required: true },
  createdBy: { type: String },
}, {
  timestamps: true,
})

EventSchema.index({ date: 1 })
EventSchema.index({ year: -1 })
EventSchema.index({ status: 1 })
EventSchema.index({ type: 1 })

export const Event = models.Event || model<IEvent>('Event', EventSchema)
