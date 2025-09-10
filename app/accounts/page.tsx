'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import AccountEditForm from '../components/AccountEditForm'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

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

export default function Accounts() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<AccountData[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        setError('No authentication token found. Please login again.')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0]) // Select first account by default
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.')
        // Clear invalid token
        localStorage.removeItem('token')
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      } else {
        setError('Failed to fetch accounts')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  // Create new account
  const handleCreate = async (formData: any) => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts([data.account, ...accounts])
        setSelectedAccount(data.account)
        setSuccess('Account created successfully!')
        setIsCreating(false)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create account')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Update account
  const handleUpdate = async (formData: any) => {
    if (!selectedAccount) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          ...formData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(accounts.map(acc => acc.id === selectedAccount.id ? data.account : acc))
        setSelectedAccount(data.account)
        setSuccess('Account updated successfully!')
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update account')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete account
  const handleDelete = async () => {
    if (!accountToDelete) return

    setIsSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(`/api/accounts?accountId=${accountToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedAccounts = accounts.filter(acc => acc.id !== accountToDelete)
        setAccounts(updatedAccounts)

        if (selectedAccount?.id === accountToDelete) {
          setSelectedAccount(updatedAccounts.length > 0 ? updatedAccounts[0] : null)
        }

        setSuccess('Account deleted successfully!')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete account')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsSaving(false)
      setShowDeleteConfirm(false)
      setAccountToDelete(null)
    }
  }

  // Set primary account
  const setPrimaryAccount = async (accountId: string) => {
    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (!token) return

      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId,
          isPrimary: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAccounts(accounts.map(acc => ({
          ...acc,
          isPrimary: acc.id === accountId
        })))
        setSuccess('Primary account updated!')
      }
    } catch (error) {
      setError('Failed to update primary account')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accounts...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="px-4 py-6 sm:px-0">
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
            <p className="mt-2 text-gray-600">Manage your multiple accounts and profiles</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Your Accounts</h2>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      + New Account
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {accounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No accounts found. Create your first account!</p>
                  ) : (
                    <div className="space-y-2">
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAccount?.id === account.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedAccount(account)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{account.fullName}</h3>
                              <p className="text-sm text-gray-600">{account.email}</p>
                              {account.currentRole && (
                                <p className="text-xs text-indigo-600 font-medium">{account.currentRole}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {account.skills && account.skills.length > 0
                                  ? account.skills.slice(0, 3).join(', ') + (account.skills.length > 3 ? '...' : '')
                                  : 'No skills added'
                                }
                              </p>
                            </div>
                            {account.isPrimary && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="lg:col-span-2">
              {isCreating ? (
                <div className="bg-white shadow-md rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Account</h2>
                  </div>
                  <div className="p-6">
                    <AccountEditForm
                      accountData={{
                        id: '',
                        fullName: '',
                        email: '',
                        phoneNumber: '',
                        address: '',
                        education: '',
                        companyHistory: '',
                        extraNote: '',
                        skills: [],
                        currentRole: '',
                        isPrimary: accounts.length === 0, // First account is primary
                        styleSettings: {},
                        createdAt: '',
                        updatedAt: '',
                      }}
                      onSave={handleCreate}
                      onCancel={() => setIsCreating(false)}
                      isSaving={isSaving}
                      isCreating={true}
                    />
                  </div>
                </div>
              ) : selectedAccount ? (
                <div className="bg-white shadow-md rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{selectedAccount.fullName}</h2>
                        {selectedAccount.isPrimary && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Primary Account
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!selectedAccount.isPrimary && (
                          <button
                            onClick={() => setPrimaryAccount(selectedAccount.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          {isEditing ? 'View' : 'Edit'}
                        </button>
                        <button
                          onClick={() => {
                            setAccountToDelete(selectedAccount.id)
                            setShowDeleteConfirm(true)
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {isEditing ? (
                      <AccountEditForm
                        accountData={selectedAccount}
                        onSave={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                        isSaving={isSaving}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <p className="text-gray-900">{selectedAccount.fullName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <p className="text-gray-900">{selectedAccount.email}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <p className="text-gray-900">{selectedAccount.phoneNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <p className="text-gray-900">{selectedAccount.address || 'Not provided'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                          <p className="text-gray-900">{selectedAccount.currentRole || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedAccount.education || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company History</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedAccount.companyHistory || 'Not provided'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedAccount.skills && selectedAccount.skills.length > 0 ? (
                              selectedAccount.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p className="text-gray-500">No skills added</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Extra Notes</label>
                          <p className="text-gray-900 whitespace-pre-wrap">{selectedAccount.extraNote || 'Not provided'}</p>
                        </div>

                        {/* Style Settings Display */}
                        {selectedAccount.styleSettings && (
                          <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Style Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Full Name:</span>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{ backgroundColor: selectedAccount.styleSettings.fullNameColor || '#1a1a1a' }}
                                    ></div>
                                    <span className="text-sm text-gray-900">{selectedAccount.styleSettings.fullNameColor || '#1a1a1a'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Current Role:</span>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{ backgroundColor: selectedAccount.styleSettings.currentRoleColor || '#4f46e5' }}
                                    ></div>
                                    <span className="text-sm text-gray-900">{selectedAccount.styleSettings.currentRoleColor || '#4f46e5'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Text Color:</span>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{ backgroundColor: selectedAccount.styleSettings.textColor || '#000000' }}
                                    ></div>
                                    <span className="text-sm text-gray-900">{selectedAccount.styleSettings.textColor || '#000000'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Background:</span>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-6 h-6 rounded border border-gray-300"
                                      style={{ backgroundColor: selectedAccount.styleSettings.bgColor || '#ffffff' }}
                                    ></div>
                                    <span className="text-sm text-gray-900">{selectedAccount.styleSettings.bgColor || '#ffffff'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Heading Font:</span>
                                  <span className="text-sm text-gray-900" style={{ fontFamily: selectedAccount.styleSettings.headingFont || 'Helvetica, sans-serif' }}>
                                    {selectedAccount.styleSettings.headingFont || 'Helvetica, sans-serif'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Text Font:</span>
                                  <span className="text-sm text-gray-900" style={{ fontFamily: selectedAccount.styleSettings.textFont || 'Arial, sans-serif' }}>
                                    {selectedAccount.styleSettings.textFont || 'Arial, sans-serif'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-500 w-24">Line Height:</span>
                                  <span className="text-sm text-gray-900">{selectedAccount.styleSettings.lineHeight || '1.5'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">Created: {new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">Updated: {new Date(selectedAccount.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <p className="text-gray-500">Select an account to view details or create a new account.</p>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete this account? This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setAccountToDelete(null)
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}