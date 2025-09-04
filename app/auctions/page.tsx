'use client'

import ProtectedRoute from '../components/ProtectedRoute'

export default function Auctions() {
  const mockAuctions = [
    {
      id: 1,
      title: "Vintage Camera Collection",
      description: "Beautiful collection of vintage cameras from the 1960s-1980s",
      currentBid: 250,
      endTime: "2024-01-15T18:00:00Z",
      image: "/api/placeholder/300/200",
      bidCount: 12
    },
    {
      id: 2,
      title: "Antique Wooden Desk",
      description: "Handcrafted oak desk from the early 1900s",
      currentBid: 450,
      endTime: "2024-01-16T20:00:00Z",
      image: "/api/placeholder/300/200",
      bidCount: 8
    },
    {
      id: 3,
      title: "Rare Book Collection",
      description: "First edition books from famous authors",
      currentBid: 180,
      endTime: "2024-01-17T15:00:00Z",
      image: "/api/placeholder/300/200",
      bidCount: 15
    }
  ]

  return (
    <ProtectedRoute>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Auctions</h1>
          <p className="mt-2 text-gray-600">Discover amazing items and place your bids</p>
        </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockAuctions.map((auction) => (
          <div key={auction.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image Placeholder</span>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{auction.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-xl font-bold text-green-600">${auction.currentBid}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Bids</p>
                  <p className="text-lg font-semibold">{auction.bidCount}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">Ends</p>
                <p className="text-sm font-medium">{new Date(auction.endTime).toLocaleDateString()}</p>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Place Bid
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
