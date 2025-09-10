'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

interface Statistics {
  overview: {
    totalBids: number
    totalAccounts: number
    recentBids: number
    weeklyBids: number
    todayBids: number
    monthlyGrowthRate: number
  }
  topAccounts: Array<{
    _id: string
    accountName: string
    accountRole: string
    count: number
  }>
  topCompanies: Array<{
    _id: string
    count: number
  }>
  monthlyTrends: Array<{
    month: string
    count: number
  }>
  recentBids: Array<{
    id: string
    companyName: string
    jobTitle: string
    createdAt: string
    accountName: string
    accountRole: string
  }>
}

export default function Dashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics')
        if (response.ok) {
          const data = await response.json()
          setStatistics(data)
        } else {
          setError('Failed to fetch statistics')
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
        setError('Failed to fetch statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return '↗'
    if (rate < 0) return '↘'
    return '→'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!statistics) return null

  return (
    <ProtectedRoute>
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="w-full bg-white rounded-xl shadow-lg p-8 mt-12 mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-6 text-center">Dashboard</h1>
            <p className="mt-2 text-gray-600 text-center">Overview of your bidding activity</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bids</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.overview.totalBids}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👤</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Accounts</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.overview.totalAccounts}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.overview.weeklyBids}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📈</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Monthly Growth</dt>
                      <dd className={`text-lg font-medium ${getGrowthColor(statistics.overview.monthlyGrowthRate)}`}>
                        {getGrowthIcon(statistics.overview.monthlyGrowthRate)} {Math.abs(statistics.overview.monthlyGrowthRate).toFixed(1)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Accounts */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Accounts by Bids</h3>
                {statistics.topAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.topAccounts.map((account, index) => (
                      <div key={account._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                            <p className="text-sm text-gray-500">{account.accountRole}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{account.count} bids</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No account data available</p>
                )}
              </div>
            </div>

            {/* Top Companies */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Companies</h3>
                {statistics.topCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {statistics.topCompanies.map((company, index) => (
                      <div key={company._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{company._id}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{company.count} bids</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No company data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bids */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bids</h3>
                <a
                  href="/bid-list"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all →
                </a>
              </div>
              {statistics.recentBids.length > 0 ? (
                <div className="overflow-hidden">
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
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statistics.recentBids.map((bid) => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bid.companyName}</div>
                              <div className="text-sm text-gray-500">{bid.jobTitle}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{bid.accountName}</div>
                              <div className="text-sm text-gray-500">{bid.accountRole}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bid.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent bids found</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/create-bid"
              className="bg-indigo-600 text-white px-6 py-4 rounded-lg shadow hover:bg-indigo-700 transition-colors text-center"
            >
              <div className="text-lg font-medium">Create New Bid</div>
              <div className="text-sm opacity-90">Start a new bidding process</div>
            </a>
            <a
              href="/accounts"
              className="bg-green-600 text-white px-6 py-4 rounded-lg shadow hover:bg-green-700 transition-colors text-center"
            >
              <div className="text-lg font-medium">Manage Accounts</div>
              <div className="text-sm opacity-90">Update your professional profiles</div>
            </a>
            <a
              href="/bid-list"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow hover:bg-blue-700 transition-colors text-center"
            >
              <div className="text-lg font-medium">View All Bids</div>
              <div className="text-sm opacity-90">Browse and manage your bids</div>
            </a>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
