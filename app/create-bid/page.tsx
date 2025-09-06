'use client'

import React, { useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface BidData {
  companyName: string
  jobTitle: string
  jobDescription: string
  link: string
  extraNote: string
}

export default function CreateBid() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<BidData>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    link: '',
    extraNote: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bid')
      }

      setSuccess('Bid created successfully!')
      setFormData({
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        link: '',
        extraNote: '',
      })

      // Redirect to bid list after 2 seconds
      setTimeout(() => {
        router.push('/bid-list')
      }, 2000)
    } catch (error) {
      console.error('Create bid error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create bid')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Create Bid
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a new bid for a job opportunity
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bid Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter company name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.companyName.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter job title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.jobTitle.length}/200 characters
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link *
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/job-posting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  required
                  rows={6}
                  maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter detailed job description"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.jobDescription.length}/5000 characters
                </p>
              </div>

            

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extra Note
                </label>
                <textarea
                  name="extraNote"
                  value={formData.extraNote}
                  onChange={handleChange}
                  rows={3}
                  // maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any additional notes about this bid"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.extraNote.length}/500 characters
                </p>
              </div> */}


              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/bid-list')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Creating...' : 'Create Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}