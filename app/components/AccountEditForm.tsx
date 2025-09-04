'use client'

import React, { useState } from 'react'

interface AccountData {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  education: string
  companyHistory: string
  extraNote: string
  skills: string[]
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

interface AccountEditFormProps {
  accountData: AccountData
  onSave: (formData: any) => Promise<void>
  onCancel: () => void
  isSaving: boolean
  isCreating?: boolean
}

export default function AccountEditForm({ accountData, onSave, onCancel, isSaving, isCreating = false }: AccountEditFormProps) {
  const [formData, setFormData] = useState({
    fullName: accountData.fullName || '',
    email: accountData.email || '',
    phoneNumber: accountData.phoneNumber || '',
    address: accountData.address || '',
    education: accountData.education || '',
    companyHistory: accountData.companyHistory || '',
    extraNote: accountData.extraNote || '',
    skills: accountData.skills || [],
    isPrimary: accountData.isPrimary || false,
  })

  const [skillsText, setSkillsText] = useState(accountData.skills ? accountData.skills.join(', ') : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Convert skills text to array
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    await onSave({
      ...formData,
      skills: skillsArray,
    })
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSkillsText(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter address"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education
        </label>
        <textarea
          value={formData.education}
          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter education details"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company History
        </label>
        <textarea
          value={formData.companyHistory}
          onChange={(e) => setFormData({ ...formData, companyHistory: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your company history and work experience"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <textarea
          value={skillsText}
          onChange={handleSkillsChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra Notes
        </label>
        <textarea
          value={formData.extraNote}
          onChange={(e) => setFormData({ ...formData, extraNote: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Any additional notes"
        />
      </div>

      {isCreating && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            checked={formData.isPrimary}
            onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
            Set as primary account
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? (isCreating ? 'Creating...' : 'Saving...') : (isCreating ? 'Create Account' : 'Save Changes')}
        </button>
      </div>
    </form>
  )
}
