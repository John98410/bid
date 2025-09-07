import mongoose, { Document, Schema } from 'mongoose'

export interface IBid extends Document {
  userId: mongoose.Types.ObjectId
  accountId: mongoose.Types.ObjectId
  companyName: string
  jobTitle: string
  jobDescription: string
  link: string
  extraNote: string
  resumeFileName: string
  createdAt: Date
  updatedAt: Date
}

const BidSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  companyName: {
    type: String,
    required: [true, 'Please provide a company name'],
    maxlength: [100, 'Company name cannot be more than 100 characters'],
  },
  jobTitle: {
    type: String,
    required: [true, 'Please provide a job title'],
    maxlength: [200, 'Job title cannot be more than 200 characters'],
  },
  jobDescription: {
    type: String,
    required: [true, 'Please provide a job description'],
    // maxlength: [5000, 'Job description cannot be more than 5000 characters'],
  },
  link: {
    type: String,
    required: [true, 'Please provide a link'],
    match: [
      /^https?:\/\/.+/,
      'Please provide a valid URL starting with http:// or https://',
    ],
  },
  extraNote: {
    type: String,
    default: '',
    // maxlength: [5000, 'Extra note cannot be more than 5000 characters'],
  },
  resumeFileName: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
})

// Index for efficient queries
BidSchema.index({ userId: 1 })
BidSchema.index({ createdAt: -1 })

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema)
