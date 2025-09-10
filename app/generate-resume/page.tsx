'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

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
  currentRole?: string
  isPrimary: boolean
}

export default function GenerateResume() {
  const { user, token } = useAuth()
  const [accountList, setAccountList] = useState<Array<Account> | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Fetch user's account data
  useEffect(() => {
    const fetchAccount = async () => {
      if (!token) return

      try {
        const response = await fetch('/api/accounts', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAccountList(data.accounts)
          const primaryAccount = data.accounts.find((acc: Account) => acc.isPrimary)
          if (primaryAccount) {
            setSelectedAccountId(primaryAccount.id)
          } else if (data.accounts.length > 0) {
            setSelectedAccountId(data.accounts[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching account:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [token])

  // Handle Excel file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload a valid Excel file (.xlsx or .xls)')
      return
    }

    setExcelFile(file)
    setUploadingFile(true)

    try {
      // Create FormData to send file to server
      const formData = new FormData()
      formData.append('excelFile', file)

      // Upload file to server
      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setExcelData(result.data)
      } else {
        alert(`Error processing Excel file: ${result.message}`)
        setExcelData([])
      }
    } catch (error) {
      console.error('Error uploading Excel file:', error)
      alert('Error uploading Excel file. Please try again.')
      setExcelData([])
    } finally {
      setUploadingFile(false)
    }
  }

  const handleGenerateResume = async () => {
    if (!selectedAccountId) {
      alert('Please ensure your account information is complete')
      return
    }

    if (!excelData || excelData.length === 0) {
      alert('Please upload an Excel file with job data first')
      return
    }

    setUploading(true)
    try {
      // Send data to server for resume generation
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: selectedAccountId.id,
          excelData: excelData
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Resume generated successfully! Created ${result.data.pendingBids.length} pending bids from ${excelData.length} job entries.`)
      } else {
        console.error('Resume generation failed:', result.message)
        alert(`Error generating resume: ${result.message}`)
      }
    } catch (error) {
      console.error('Error generating resume:', error)
      alert('Error generating resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your accounts...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div
          className="mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Generate Resume
            </h1>
            <p className="mt-2 text-gray-600">Create a professional resume using your account information and uploaded data</p>
          </div>

          {/* Account Information Section */}
          <div className="bg-white shadow-md rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Account</h2>
            </div>
            <div className="p-6">
              {accountList && accountList.length > 0 ? (
                <div>
                  {loading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      Loading accounts...
                    </div>
                  ) : (
                    <select
                      name="selectedAccountId"
                      value={selectedAccountId?.id || ''}
                      onChange={(e) => setSelectedAccountId(accountList.find((account) => account.id === e.target.value) || null)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select an account</option>
                      {accountList.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.fullName} {account.isPrimary ? '(Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No account information found. Please create an account first.</p>
                  <button
                    onClick={() => window.location.href = '/accounts'}
                    className="mt-2 text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Go to Account Settings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Excel Upload Section */}
          <div className="bg-white shadow-md rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upload Excel File</h2>
              <p className="text-sm text-gray-600">Upload an Excel file with additional information for your resume</p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="excel-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Excel file
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        .xlsx and .xls files only, up to 10MB
                      </span>
                      <input
                        id="excel-upload"
                        name="excel-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {uploadingFile && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">
                        Processing Excel file...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {excelFile && !uploadingFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        File uploaded: {excelFile.name}
                      </p>
                      <p className="text-sm text-green-600">
                        Size: {(excelFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {excelData.length > 0 && (
                        <p className="text-sm text-green-600">
                          Jobs loaded: {excelData.length}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Display Excel Data as Table */}
              {excelData.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Loaded Job Data</h3>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Job Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Link
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {excelData.map((job, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {job.jobTitle}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {job.companyName}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs">
                                  <p className="line-clamp-3">{job.jobDescription}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {job.link ? (
                                  <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 break-all max-w-xs block"
                                  >
                                    {job.link.length > 30 ? `${job.link.substring(0, 30)}...` : job.link}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400">No link</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Showing {excelData.length} job{excelData.length !== 1 ? 's' : ''} from Excel file
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleGenerateResume}
            disabled={!selectedAccountId || uploading}
            className="text-centerinline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              'textAlign': 'center',
              'alignItems': 'center',
              'display': 'flex',
              'justifySelf': 'anchor-center'
            }}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Resume...
              </>
            ) : (
              'Generate Resume'
            )}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  )
}