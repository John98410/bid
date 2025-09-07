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
  currentRole: string
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
    currentRole: accountData.currentRole || '',
    isPrimary: accountData.isPrimary || false,
  })

  const [styleSettings, setStyleSettings] = useState({
    fullNameColor: accountData.styleSettings?.fullNameColor || '#1a1a1a',
    currentRoleColor: accountData.styleSettings?.currentRoleColor || '#4f46e5',
    textColor: accountData.styleSettings?.textColor || '#000000',
    bgColor: accountData.styleSettings?.bgColor || '#ffffff',
    headingFont: accountData.styleSettings?.headingFont || 'Helvetica, sans-serif',
    textFont: accountData.styleSettings?.textFont || 'Arial, sans-serif',
    lineHeight: accountData.styleSettings?.lineHeight || '1.5',
  })

  const [skillsText, setSkillsText] = useState(accountData.skills ? accountData.skills.join(', ') : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Convert skills text to array
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    await onSave({
      ...formData,
      skills: skillsArray,
      styleSettings,
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
          Current Position
        </label>
        <input
          type="text"
          value={formData.currentRole}
          onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your current job title/role"
        />
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

      {/* Style Settings Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Style Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styleSettings.fullNameColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, fullNameColor: e.target.value })}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styleSettings.fullNameColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, fullNameColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#1a1a1a"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Title Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styleSettings.currentRoleColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, currentRoleColor: e.target.value })}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styleSettings.currentRoleColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, currentRoleColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#4f46e5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styleSettings.textColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, textColor: e.target.value })}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styleSettings.textColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styleSettings.bgColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, bgColor: e.target.value })}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styleSettings.bgColor}
                onChange={(e) => setStyleSettings({ ...styleSettings, bgColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heading Font
            </label>
            <select
              value={styleSettings.headingFont}
              onChange={(e) => setStyleSettings({ ...styleSettings, headingFont: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Courier New, monospace">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Font
            </label>
            <select
              value={styleSettings.textFont}
              onChange={(e) => setStyleSettings({ ...styleSettings, textFont: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Helvetica, sans-serif">Helvetica</option>
              <option value="Times New Roman, serif">Times New Roman</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Courier New, monospace">Courier New</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Height
            </label>
            <select
              value={styleSettings.lineHeight}
              onChange={(e) => setStyleSettings({ ...styleSettings, lineHeight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1.0">1.0 (Tight)</option>
              <option value="1.2">1.2 (Compact)</option>
              <option value="1.4">1.4 (Normal)</option>
              <option value="1.5">1.5 (Comfortable)</option>
              <option value="1.6">1.6 (Spacious)</option>
              <option value="1.8">1.8 (Very Spacious)</option>
              <option value="2.0">2.0 (Very Loose)</option>
            </select>
          </div>
        </div>
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
