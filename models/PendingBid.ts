import mongoose, { Document, Schema } from 'mongoose'

export interface IPendingBid extends Document {
  jobTitle: string
  companyName: string
  jobDescription: string
  link: string
  account_id: mongoose.Types.ObjectId
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const PendingBidSchema: Schema = new Schema({
  jobTitle: {
    type: String,
    required: [true, 'Please provide a job title'],
    // maxlength: [200, 'Job title cannot be more than 200 characters'],
  },
  companyName: {
    type: String,
    required: [true, 'Please provide a company name'],
    // maxlength: [200, 'Company name cannot be more than 200 characters'],
  },
  jobDescription: {
    type: String,
    required: [true, 'Please provide a job description'],
    // maxlength: [2000, 'Job description cannot be more than 2000 characters'],
  },
  link: {
    type: String,
    required: [true, 'Please provide a job link'],
    validate: {
      validator: function (v: string) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'Please provide a valid URL'
    }
  },
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Please provide an account ID'],
  },
  resumeFileName: {
    type: String,
    required: [true, 'Please provide a resume file name'],
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
})

// Index for efficient queries
PendingBidSchema.index({ account_id: 1, status: 1 })
PendingBidSchema.index({ createdAt: -1 })

export default mongoose.models.PendingBid || mongoose.model<IPendingBid>('PendingBid', PendingBidSchema)
