'use client'

import ProtectedRoute from '../components/ProtectedRoute'

export default function CreateBid() {
  return (
    <ProtectedRoute>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">Create Bid</h1>
        <p className="mt-2 text-gray-600">Create a new bid</p>
      </div>
    </ProtectedRoute>
  )
}
