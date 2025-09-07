import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import Bid from '@/models/Bid'
import { generateResumePDFBuffer } from '@/lib/resume-generator'
import Account from '@/models/Account'
export const dynamic = 'force-dynamic';

// PUT /api/bids/report - Report a bid
export async function PUT(request: NextRequest) {
    try {
        await connectDB()

        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json(
                { message: 'No token provided' },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)
        if (!decoded) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 401 }
            )
        }
        const { id, reportStatus } = await request.json()

        if (!id) {
            return NextResponse.json(
                { message: 'Bid ID is required' },
                { status: 400 }
            )
        }
        const bid = await Bid.findOneAndUpdate(
            { _id: id },
            {
                reportStaus: reportStatus,
            },
            { new: true, runValidators: true }
        );

        if (!bid) {
            return NextResponse.json(
                { message: 'Bid not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({
            message: `Bid report is ` + reportStatus ? 'activated' : 'deactivated' + ' successfully',
        }, { status: 200 })

    } catch (error) {
        console.error('Report bid error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}