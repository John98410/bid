import mongoose, { Document, Schema } from 'mongoose'

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId
  fullName: string
  email: string
  phoneNumber?: string
  address?: string
  education?: string
  companyHistory?: string
  extraNote?: string
  skills?: string[]
  currentRole?: string
  isPrimary: boolean
  styleSettings?: {
    fullNameColor?: string
    currentRoleColor?: string
    textColor?: string
    bgColor?: string
    headingFont?: string
    textFont?: string
    lineHeight?: string
  }
  createdAt: Date
  updatedAt: Date
}

const AccountSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: [true, 'Please provide a full name'],
    maxlength: [100, 'Full name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phoneNumber: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  education: {
    type: String,
    default: '',
  },
  companyHistory: {
    type: String,
    default: '',
  },
  extraNote: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  currentRole: {
    type: String,
    default: '',
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  styleSettings: {
    fullNameColor: {
      type: String,
      default: '#1a1a1a',
    },
    currentRoleColor: {
      type: String,
      default: '#4f46e5',
    },
    textColor: {
      type: String,
      default: '#000000',
    },
    bgColor: {
      type: String,
      default: '#ffffff',
    },
    headingFont: {
      type: String,
      default: 'Helvetica, sans-serif',
    },
    textFont: {
      type: String,
      default: 'Arial, sans-serif',
    },
    lineHeight: {
      type: String,
      default: '1.5',
    },
  },
}, {
  timestamps: true,
})

// Ensure only one primary account per user
AccountSchema.index({ userId: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } })

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema)

