'use client'

import React, { useState, useEffect } from 'react'
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

interface Account {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  address?: string
  education?: string
  companyHistory?: string
  extraNote?: string
  skills?: string[]
  isPrimary: boolean
}

export default function CreateBid() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resumeError, setResumeError] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [loadingAccounts, setLoadingAccounts] = useState(true)

  const [formData, setFormData] = useState<BidData>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    link: '',
    extraNote: '',
  })

  // Fetch user's accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        if (!token) return

        const response = await fetch('/api/accounts', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts)
          // Set primary account as default selection
          const primaryAccount = data.accounts.find((acc: Account) => acc.isPrimary)
          if (primaryAccount) {
            setSelectedAccountId(primaryAccount.id)
          } else if (data.accounts.length > 0) {
            setSelectedAccountId(data.accounts[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
      } finally {
        setLoadingAccounts(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')
    setResumeError('')

    try {
      // Then generate and download resume
      try {
        const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)
        const resumeResponse = await fetch('/api/bids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobDescription: formData.jobDescription,
            jobTitle: formData.jobTitle,
            companyName: formData.companyName,
            accountId: selectedAccountId,
            link: formData.link,
          }),
        })
        if (resumeResponse.ok) {
          // Create blob and download
          const blob = await resumeResponse.blob()
          const url = window.URL.createObjectURL(blob)
          
          // Download the PDF
          const a = document.createElement('a')
          a.href = url
          a.download = `${selectedAccount?.fullName}(${formData.companyName}_${formData.jobTitle || 'job'}).pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          
          // Open PDF in new tab
          const newTab = window.open(url, '_blank')
          if (newTab) {
            newTab.focus()
          }
          
          // Clean up URL after a delay to allow the new tab to load
          setTimeout(() => {
            window.URL.revokeObjectURL(url)
          }, 1000)
          
          setSuccess('Bid created and resume generated successfully!')
        } else {
          const resumeErrorData = await resumeResponse.json()
          if (resumeResponse.status === 400) {
            // Handle validation errors
            if (resumeErrorData.errors && Array.isArray(resumeErrorData.errors)) {
              setResumeError(resumeErrorData.errors.join('. '))
            } else {
              setResumeError(resumeErrorData.message || 'Validation failed')
            }
          } else if (resumeResponse.status === 409) {
            setResumeError(resumeErrorData.message || 'A bid with this account and job link already exists.')
          } else {
            setResumeError(resumeErrorData.message || 'Failed to generate resume')
          }
          setSuccess('Bid creation failed.')
        }
      } catch (resumeError) {
        console.error('Resume generation error:', resumeError)
        setResumeError('Failed to generate resume')
        setSuccess('Bid created successfully, but resume generation failed.')
      }

      setFormData({
        companyName: '',
        jobTitle: '',
        jobDescription: '',
        link: '',
        extraNote: '',
      })
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
              Create a new bid for a job opportunity and generate a tailored resume
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

              {resumeError && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                  {resumeError}
                </div>
              )}

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Account *
                </label>
                {loadingAccounts ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    Loading accounts...
                  </div>
                ) : (
                  <select
                    name="selectedAccountId"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.fullName} {account.isPrimary ? '(Primary)' : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Choose which account profile to use for resume generation
                </p>
              </div>

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
                  // maxLength={5000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter detailed job description"
                />
                {/* <p className="text-xs text-gray-500 mt-1">
                  {formData.jobDescription.length}/5000 characters
                </p> */}
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
                  disabled={isSaving || !selectedAccountId}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Creating Bid & Generating Resume...' : 'Create Bid & Generate Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}