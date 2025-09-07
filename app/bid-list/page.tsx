'use client'

import { useState, useEffect, useCallback } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

interface Bid {
  id: string
  accountId: string
  accountName: string
  accountRole: string
  companyName: string
  jobTitle: string
  jobDescription: string
  link: string
  resumeFileName: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalBids: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface Account {
  id: string
  fullName: string
  currentRole: string
}

export default function BidList() {
  const [bids, setBids] = useState<Bid[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalBids: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [todayBidCount, setTodayBidCount] = useState(0)
  const [editingBid, setEditingBid] = useState<Bid | null>(null)
  const [editForm, setEditForm] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    link: '',
    resumeFileName: ''
  })
  const [success, setSuccess] = useState('')

  // Fetch accounts for filter dropdown
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data.accounts || [])
        }
      } catch (error) {
        console.error('Error fetching accounts:', error)
      }
    }
    fetchAccounts()
  }, [])

  // Fetch bids with current filters
  const fetchBids = useCallback(async (page = 1, search = searchTerm, accountId = selectedAccountId, fromDate = dateFrom, toDate = dateTo) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(accountId && { accountId }),
        ...(fromDate && { dateFrom: fromDate }),
        ...(toDate && { dateTo: toDate })
      })

      const response = await fetch(`/api/bids?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBids(data.bids || [])
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalBids: 0 })
      } else {
        setError('Failed to fetch bids')
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
      setError('Failed to fetch bids')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedAccountId, dateFrom, dateTo])

  // Fetch today's bid count
  const fetchTodayBidCount = useCallback(async () => {
    try {
      const response = await fetch('/api/statistics')
      if (response.ok) {
        const data = await response.json()
        setTodayBidCount(data.overview.todayBids || 0)
      }
    } catch (error) {
      console.error('Error fetching today bid count:', error)
    }
  }, [])

  // Initial load and when filters change
  useEffect(() => {
    fetchBids(1, searchTerm, selectedAccountId, dateFrom, dateTo)
    fetchTodayBidCount()
  }, [searchTerm, selectedAccountId, dateFrom, dateTo, fetchBids, fetchTodayBidCount])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBids(1, searchTerm, selectedAccountId, dateFrom, dateTo)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedAccountId('')
    setDateFrom('')
    setDateTo('')
    fetchBids(1, '', '', '', '')
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchBids(newPage, searchTerm, selectedAccountId, dateFrom, dateTo)
  }

  // Handle edit bid
  const handleEdit = (bid: Bid) => {
    setEditingBid(bid)
    setEditForm({
      companyName: bid.companyName,
      jobTitle: bid.jobTitle,
      jobDescription: bid.jobDescription,
      link: bid.link,
      resumeFileName: bid.resumeFileName
    })
  }

  // Handle update bid
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBid) return

    try {
      const response = await fetch('/api/bids', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBid.id,
          ...editForm
        })
      })

      if (response.ok) {
        setEditingBid(null)
        fetchBids(pagination.currentPage, searchTerm, selectedAccountId, dateFrom, dateTo)
        fetchTodayBidCount()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update bid')
      }
    } catch (error) {
      console.error('Error updating bid:', error)
      setError('Failed to update bid')
    }
  }

  // Handle report bid
  const handleReport = async (e:any, bidId: string) => {
    try {
      let reportStatus = e.target.checked;
      console.log(reportStatus);
      const response = await fetch(`/api/bids/report`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bidId,
          reportStatus: reportStatus
        })
      });

      if (response.ok) {
        
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to report bid')
      }
    } catch (e) {
      console.error('Error reporting bid:', error)
      setError('Failed to report bid')
    }
  }

  // Handle delete bid
  const handleDelete = async (bidId: string) => {
    if (!confirm('Are you sure you want to delete this bid?')) return

    try {
      const response = await fetch(`/api/bids?id=${bidId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBids(pagination.currentPage, searchTerm, selectedAccountId, dateFrom, dateTo)
        fetchTodayBidCount()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete bid')
      }
    } catch (error) {
      console.error('Error deleting bid:', error)
      setError('Failed to delete bid')
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ProtectedRoute>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
        <h1 className="text-3xl font-bold text-gray-900">Bid List</h1>
              <p className="mt-2 text-gray-600">View and manage all your bids</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 w-full sm:w-auto">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📅</span>
                  </div>
                </div>
                
                <div className="ml-3">
                  <p className="text-sm font-medium text-indigo-900">Today&apos;s Bids</p>
                  <p className="text-lg font-bold text-indigo-600">{todayBidCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, job title, description, or resume file name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="accountFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Account
                </label>
                <select
                  id="accountFilter"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.fullName} - {account.currentRole}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Bids List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bids...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No bids found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Company & Job
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Account
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Description
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Resume File Name
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Created
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Actions
                        </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th> */}
                   </tr>
                 </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bid.companyName}</div>
                          <div className="text-sm text-gray-500">{bid.jobTitle}</div>
                          {bid.link && (
                            <a
                              href={bid.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              View Job Posting →
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bid.accountName}</div>
                          <div className="text-sm text-gray-500">{bid.accountRole}</div>
                        </div>
                      </td>
                       <td className="px-6 py-4">
                         <div className="text-sm text-gray-900 max-w-xs truncate">
                           {bid.jobDescription}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 max-w-xs">
                           {bid.resumeFileName || 'N/A'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {formatDate(bid.createdAt)}
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(bid)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <span className='divider'></span>
                          <button
                            onClick={() => handleDelete(bid.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input type="checkbox" onClick={(e) => handleReport(e, bid.id)}/> Active
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {((pagination.currentPage - 1) * 10) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * 10, pagination.totalBids)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalBids}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingBid && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Bid</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={editForm.jobTitle}
                      onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description
                    </label>
                    <textarea
                      value={editForm.jobDescription}
                      onChange={(e) => setEditForm({ ...editForm, jobDescription: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Link
                    </label>
                    <input
                      type="url"
                      value={editForm.link}
                      onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resume File Name
                    </label>
                    <input
                      readOnly
                      value={editForm.resumeFileName}
                      onChange={(e) => setEditForm({ ...editForm, resumeFileName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingBid(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Update Bid
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
