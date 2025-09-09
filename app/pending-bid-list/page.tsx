"use client";
import ProtectedRoute from '../components/ProtectedRoute';
import React, { useEffect, useState } from 'react';

type PendingBid = {
    _id: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    link: string;
    status: string;
    createdAt: string;
    resumeFileName: string;
};

const PAGE_SIZE = 10;

export default function PendingBidList() {
    const [data, setData] = useState<PendingBid[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
    const [selected, setSelected] = useState<PendingBid | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/pending-bid-list?page=${page}&pageSize=${PAGE_SIZE}`)
            .then(res => res.json())
            .then(res => {
                setData(res.data);
                setTotal(res.total);
                setLoading(false);
            });
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <ProtectedRoute>
            <div className="flex flex-row gap-6 px-4 py-6 sm:px-0">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">Pending Bid List</h1>
                        <div>
                        </div>
                    </div>
                    <div className='row mb-4 justify-end' style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button className={`mr-2 px-3 py-1 rounded ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`} onClick={() => setViewMode('table')}>Table</button>
                        <button className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`} onClick={() => setViewMode('card')}>Card</button>
                    </div>

                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.map(bid => (
                                <div key={bid._id} className={`border rounded p-4 shadow ${selected?._id === bid._id ? 'border-indigo-600' : ''}`}>
                                    <h2 className="font-bold text-lg">{bid.jobTitle}</h2>
                                    <p className="text-gray-700">{bid.companyName}</p>
                                    <p className="text-sm text-gray-500">{bid.status}</p>
                                    <p className="text-xs text-gray-400 mb-2">{new Date(bid.createdAt).toLocaleDateString()}</p>
                                    <a href={bid.link} target="_blank" rel="noopener" className="text-indigo-600 underline mb-2 block">
                                        {bid.link.length > 30 ? bid.link.slice(0, 30) + '...' : bid.link}
                                    </a>
                                    <button className="text-indigo-600" onClick={() => setSelected(bid)}>View Details</button>
                                    <span className='seperator'> | </span>
                                    <button className="text-red-600 underline" onClick={async () => {
                                        if (confirm('Delete this pending bid?')) {
                                            setLoading(true);
                                            await fetch(`/api/pending-bid-list/delete?id=${bid._id}`, { method: 'DELETE' });
                                            setSelected(null);
                                            fetch(`/api/pending-bid-list?page=${page}&pageSize=${PAGE_SIZE}`)
                                                .then(res => res.json())
                                                .then(res => {
                                                    setData(res.data);
                                                    setTotal(res.total);
                                                    setLoading(false);
                                                });
                                        }
                                    }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center items-center mt-4 gap-2">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
                        <span>Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
                <div className="w-min-xl border-l pl-6">
                    {selected ? (
                        <div>
                            <h2 className="text-xl font-bold mb-2">Job Description</h2>
                            <p className="mb-4 whitespace-pre-line">{selected.jobDescription}</p>
                            <h2 className="text-xl font-bold mb-2">Resume PDF</h2>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <iframe
                                    src={`/auto_generated_resumes/${encodeURIComponent(selected.resumeFileName)}`}
                                    title="Resume PDF"
                                    width="100%"
                                    height="700px"
                                    style={{ minWidth: '600px', width: '100%' }}
                                    className="border rounded"
                                />
                                <a href={`/auto_generated_resumes/${encodeURIComponent(selected.resumeFileName)}`} target="_blank" rel="noopener" className="block mt-2 text-indigo-600 underline">Open PDF in new tab</a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500">Select a bid to view details</div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}