"use client";
import ProtectedRoute from '../components/ProtectedRoute';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'
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

type PendingBid = {
    _id: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    link: string;
    status: string;
    createdAt: string;
    resumeFileName: string;
    account_id: string;
};

const PAGE_SIZE = 100;

export default function PendingBidList() {
    const [data, setData] = useState<PendingBid[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<PendingBid | null>(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const { user, token } = useAuth()
    const [accountList, setAccountList] = useState<Array<Account> | null>(null)
    const [accountFilter, setAccountFilter] = useState<string>('');
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
                }
            } catch (error) {
                console.error('Error fetching account:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAccount()
    }, [token])

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const filteredData = accountFilter ? data.filter(bid => bid.account_id === accountFilter) : data;

    return (
        <ProtectedRoute>
            <div className="flex flex-row gap-8 px-4 py-8 sm:px-0 bg-gray-50 min-h-screen">
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-4 md:mb-0">Pending Bid List</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 font-medium">Total: <span className="font-bold text-indigo-600">{filteredData.length}</span></span>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={accountFilter}
                                onChange={e => setAccountFilter(e.target.value)}
                            >
                                <option value="">All Accounts</option>
                                {accountList?.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.email}</option>
                                ))}
                            </select>
                            <button className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-600 text-indigo-600'}`} onClick={() => setViewMode('table')}>Table</button>
                            <button className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-600 text-indigo-600'}`} onClick={() => setViewMode('card')}>Card</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-indigo-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Account</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Job Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Company Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Link</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((bid, idx) => (
                                        <tr key={bid._id} className={selected?._id === bid._id ? 'bg-indigo-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-4 py-3 font-medium text-gray-700">{accountList?.find(acc => acc.id === bid.account_id)?.email || bid.account_id}</td>
                                            <td className="px-6 py-3 font-semibold text-gray-900">{bid.jobTitle}</td>
                                            <td className="px-6 py-3 text-gray-700">{bid.companyName}</td>
                                            <td className="px-6 py-3">
                                                <a href={bid.link} target="_blank" rel="noopener" className="text-indigo-600 underline hover:text-indigo-800 transition-colors duration-150">
                                                    {bid.link.length > 30 ? bid.link.slice(0, 30) + '...' : bid.link}
                                                </a>
                                            </td>
                                            <td className="px-6 py-3 flex gap-2">
                                                <button className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold" onClick={() => setSelected(bid)}>View</button>
                                                <button className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold" onClick={async () => {
                                                    if (confirm('Delete this pending bid?')) {
                                                        setLoading(true);
                                                        await fetch(`/api/pending-bid-list?id=${bid._id}`, { method: 'DELETE' });
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
                                                <button className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold" onClick={async () => {
                                                    if (!confirm("Regenerate resume for this bid?")) return;
                                                    let response = await fetch(`/api/pending-bid-list`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ id: bid._id, action: "update" })
                                                    });
                                                    if (response.ok) {
                                                        alert("update resume success");
                                                    }
                                                }}>Update Resume</button>
                                                <button className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold" onClick={async () => {
                                                    if (!confirm('Are you sure to activate this bid? Once activated, it will be moved to Active Bids list.'))
                                                        return;
                                                    setLoading(true);
                                                    await fetch(`/api/pending-bid-list`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ id: bid._id, action: "active" })
                                                    });
                                                    setSelected(null);
                                                    fetch(`/api/pending-bid-list?page=${page}&pageSize=${PAGE_SIZE}`)
                                                        .then(res => res.json())
                                                        .then(res => {
                                                            setData(res.data);
                                                            setTotal(res.total);
                                                            setLoading(false);
                                                        });
                                                }}>Active</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredData.map(bid => (
                                <div key={bid._id} className={`border rounded-xl p-6 shadow-lg bg-white hover:shadow-2xl transition-shadow duration-200 ${selected?._id === bid._id ? 'border-indigo-600' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                                            {accountList?.find(acc => acc.id === bid.account_id)?.email || bid.account_id}
                                        </span>
                                    </div>
                                    <h2 className="font-bold text-xl text-indigo-700 mb-1">{bid.jobTitle}</h2>
                                    <p className="text-gray-700 font-medium mb-1">{bid.companyName}</p>
                                    <a href={bid.link} target="_blank" rel="noopener" className="text-indigo-600 underline mb-2 block hover:text-indigo-800 transition-colors duration-150">
                                        {bid.link.length > 30 ? bid.link.slice(0, 30) + '...' : bid.link}
                                    </a>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-semibold" onClick={() => setSelected(bid)}>View</button>
                                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-semibold" onClick={async () => {
                                            if (confirm('Delete this pending bid?')) {
                                                setLoading(true);
                                                await fetch(`/api/pending-bid-list?id=${bid._id}`, { method: 'DELETE' });
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
                                        <button className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-semibold" onClick={async () => {
                                            setLoading(true);
                                            await fetch(`/api/pending-bid-list`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id: bid._id, action: "update" })
                                            });
                                            setSelected(null);
                                            fetch(`/api/pending-bid-list?page=${page}&pageSize=${PAGE_SIZE}`)
                                                .then(res => res.json())
                                                .then(res => {
                                                    setData(res.data);
                                                    setTotal(res.total);
                                                    setLoading(false);
                                                });
                                        }}>Update</button>
                                        <button className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 font-semibold" onClick={async () => {
                                            setLoading(true);
                                            await fetch(`/api/pending-bid-list`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ id: bid._id, action: "active" })
                                            });
                                            setSelected(null);
                                            fetch(`/api/pending-bid-list?page=${page}&pageSize=${PAGE_SIZE}`)
                                                .then(res => res.json())
                                                .then(res => {
                                                    setData(res.data);
                                                    setTotal(res.total);
                                                    setLoading(false);
                                                });
                                        }}>Active</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center items-center mt-8 gap-4">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold disabled:opacity-50">Prev</button>
                        <span className="font-medium text-gray-700">Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold disabled:opacity-50">Next</button>
                    </div>
                </div>
                <div className="w-full md:w-96 border-l pl-8 bg-white rounded-xl shadow-lg">
                    {selected ? (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Resume File Name</h2>
                            <p className="mb-4 whitespace-pre-line text-gray-700">{selected.resumeFileName}</p>
                            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Resume PDF</h2>
                            <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
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
                            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Job Description</h2>
                            <p className="mb-4 whitespace-pre-line text-gray-700">{selected.jobDescription}</p>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-lg font-medium flex items-center justify-center h-full">Select a bid to view details</div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}