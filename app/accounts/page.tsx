'use client'

import ProtectedRoute from '../components/ProtectedRoute'

export default function Accounts() {
  return (
    <ProtectedRoute>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
        <p className="mt-2 text-gray-600">Manage your account settings</p>
      </div>
    </ProtectedRoute>
  )
}
