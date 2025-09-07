import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import Bid from '@/models/Bid'
import { generateResumePDFBuffer } from '@/lib/resume-generator'
import Account from '@/models/Account'
// GET /api/bids - Get all bids for the authenticated user with pagination and search
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const accountId = searchParams.get('accountId') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build query
    const query: any = { userId: decoded.userId }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { jobDescription: { $regex: search, $options: 'i' } },
        { resumeFileName: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (accountId) {
      query.accountId = accountId
    }

    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        query.createdAt.$lte = toDate
      }
    }

    // Get total count for pagination
    const totalBids = await Bid.countDocuments(query)
    const totalPages = Math.ceil(totalBids / limit)
    const skip = (page - 1) * limit

    // Get bids with pagination
    const bids = await Bid.find(query)
      .populate('accountId', 'fullName currentRole')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      bids: bids.map(bid => ({
        id: bid._id,
        accountId: bid.accountId,
        accountName: bid.accountId?.fullName || 'Unknown Account',
        accountRole: bid.accountId?.currentRole || '',
        companyName: bid.companyName,
        jobTitle: bid.jobTitle,
        jobDescription: bid.jobDescription,
        link: bid.link,
        extraNote: bid.extraNote,
        resumeFileName: bid.resumeFileName || '',
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalBids,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
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
    
    const { companyName, jobTitle, jobDescription, link, accountId } = await request.json()

    // Basic validation
    if (!companyName || !jobTitle || !jobDescription || !link || !accountId) {
      return NextResponse.json(
        { message: 'Please provide company name, job title, job description, link, and account ID' },
        { status: 400 }
      )
    }

    // Enhanced validation
    const validationErrors = []

    // Company name validation
    if (companyName.trim().length < 2) {
      validationErrors.push('Company name must be at least 2 characters long')
    }
    if (companyName.trim().length > 100) {
      validationErrors.push('Company name cannot exceed 100 characters')
    }

    // Job title validation
    if (jobTitle.trim().length < 2) {
      validationErrors.push('Job title must be at least 2 characters long')
    }
    if (jobTitle.trim().length > 200) {
      validationErrors.push('Job title cannot exceed 200 characters')
    }

    // Job description validation
    if (jobDescription.trim().length < 10) {
      validationErrors.push('Job description must be at least 10 characters long')
    }
    if (jobDescription.trim().length > 5000) {
      validationErrors.push('Job description cannot exceed 5000 characters')
    }

    // URL validation
    const urlPattern = /^https?:\/\/.+\..+/
    if (!urlPattern.test(link)) {
      validationErrors.push('Please provide a valid URL starting with http:// or https://')
    }

    // Account ID validation
    if (!accountId.match(/^[0-9a-fA-F]{24}$/)) {
      validationErrors.push('Invalid account ID format')
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      )
    }

    // Check if account exists and belongs to user
    const account = await Account.findOne({ _id: accountId, userId: decoded.userId })
    
    if (!account) {
      return NextResponse.json(
        { message: 'Account not found or does not belong to you' },
        { status: 404 }
      )
    }

    // Check for duplicate bid before generating resume
    const existingBid = await Bid.findOne({
      userId: decoded.userId,
      accountId,
      link
    })

    if (existingBid) {
      return NextResponse.json(
        { 
          message: 'A bid with this account and job link already exists. Please use a different account or job link.',
          existingBid: {
            id: existingBid._id,
            companyName: existingBid.companyName,
            jobTitle: existingBid.jobTitle,
            createdAt: existingBid.createdAt
          }
        },
        { status: 409 }
      )
    }
    
    // Generate resume only after all validations pass
    const pdfBuffer = await generateResumePDFBuffer(jobTitle, jobDescription, account)
    const resumeFileName = `${account.fullName}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getUTCDate()}.pdf`;
    
    // Create bid in database
    await Bid.create({
      userId: decoded.userId,
      accountId,
      companyName,
      jobTitle,
      jobDescription,
      link,
      resumeFileName,
    })
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resumeFileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Create bid error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bids - Update a bid
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

    const { id, companyName, jobTitle, jobDescription, link, extraNote } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Bid ID is required' },
        { status: 400 }
      )
    }

    // Find and update the bid
    const bid = await Bid.findOneAndUpdate(
      { _id: id, userId: decoded.userId },
      { 
        companyName, 
        jobTitle, 
        jobDescription, 
        link, 
        extraNote: extraNote || '' 
      },
      { new: true, runValidators: true }
    )

    if (!bid) {
      return NextResponse.json(
        { message: 'Bid not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Bid updated successfully',
      bid: {
        id: bid._id,
        accountId: bid.accountId,
        companyName: bid.companyName,
        jobTitle: bid.jobTitle,
        jobDescription: bid.jobDescription,
        link: bid.link,
        extraNote: bid.extraNote,
        resumeFileName: bid.resumeFileName || '',
        createdAt: bid.createdAt,
        updatedAt: bid.updatedAt,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Update bid error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bids - Delete a bid
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Bid ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the bid
    const bid = await Bid.findOneAndDelete({ _id: id, userId: decoded.userId })

    if (!bid) {
      return NextResponse.json(
        { message: 'Bid not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Bid deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Delete bid error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
