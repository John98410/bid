import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import Bid from '@/models/Bid'

// GET /api/bids - Get all bids for the authenticated user
export async function GET(request: NextRequest) {
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

    // Get all bids for this user
    const bids = await Bid.find({ userId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json({
      bids: bids.map(bid => ({
        id: bid._id,
        companyName: bid.companyName,
        jobTitle: bid.jobTitle,
        jobDescription: bid.jobDescription,
        link: bid.link,
        extraNote: bid.extraNote,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      })),
    }, { status: 200 })
  } catch (error) {
    console.error('Get bids error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bids - Create a new bid
export async function POST(request: NextRequest) {
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
    
    const { companyName, jobTitle, jobDescription, link, extraNote } = await request.json()

    // Validation
    if (!companyName || !jobTitle || !jobDescription || !link) {
      return NextResponse.json(
        { message: 'Please provide company name, job title, job description, and link' },
        { status: 400 }
      )
    }

    // Create new bid
    const bid = await Bid.create({
      userId: decoded.userId,
      companyName,
      jobTitle,
      jobDescription,
      link,
      extraNote: extraNote || '',
    })

    return NextResponse.json({
      message: 'Bid created successfully',
      bid: {
        id: bid._id,
        companyName: bid.companyName,
        jobTitle: bid.jobTitle,
        jobDescription: bid.jobDescription,
        link: bid.link,
        extraNote: bid.extraNote,
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create bid error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
