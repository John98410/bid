import ProtectedRoute from '../components/ProtectedRoute'

export default function PendingBidList() { 
    return (
        <ProtectedRoute>
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-3xl font-bold text-gray-900">Pending Bid List</h1>
            </div>
        </ProtectedRoute>
    )
};