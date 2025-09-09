import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { headers } from 'next/headers'
import connectDB from '@/lib/mongodb'
import Account from '@/models/Account'
import PendingBid from '@/models/PendingBid'
import Bid from '@/models/Bid'
import { generateResumePDFBuffer } from '@/lib/resume-generator'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

interface JobData {
  jobTitle: string
  companyName: string
  jobDescription: string
  link: string
}

interface ResumeGenerationRequest {
  accountId: string
  excelData: JobData[]
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const headerList = headers()
    const authHeader = headerList.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: ResumeGenerationRequest = await request.json()
    const { accountId, excelData } = body
    
    if (!accountId) {
      return NextResponse.json(
        { message: 'Account ID is required' },
        { status: 400 }
      )
    }

    if (!excelData || excelData.length === 0) {
      return NextResponse.json(
        { message: 'Excel data is required' },
        { status: 400 }
      )
    }

    // Connect to database and fetch account details
    await connectDB()
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: decoded.userId 
    })
    if (!account) {
      return NextResponse.json(
        { message: 'Account not found or access denied' },
        { status: 404 }
      )
    }
  
    const pendingBids = []
    let total = excelData.length
    let current = 0
    for (const job of excelData) {
      const existingPendingBid = await PendingBid.findOne({ link: job.link, accountId: account._id });
      if (existingPendingBid) {
        continue
      }
      const existingBid = await Bid.findOne({ link: job.link, accountId: account._id });
      if (existingBid) {
        continue
      }
      const pdfBuffer = await generateResumePDFBuffer(job.jobTitle, job.jobDescription, account)
      const pdfName = `${account.fullName}(${job.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${job.jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}).pdf`;
      const filePath = path.join(process.cwd(), 'public', 'auto_generated_resumes', pdfName);
      fs.writeFileSync(filePath, pdfBuffer);
      console.log('PDF saved to:', filePath, ` total/current = ${total}/${++current}`)
      const pendingBid = new PendingBid({
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        jobDescription: job.jobDescription,
        link: job.link,
        account_id: account._id,
        resumeFileName: pdfName
      })
      await pendingBid.save()
      pendingBids.push(pendingBid)
    }
    return NextResponse.json({
      success: true,
      message: 'Resume generated successfully',
      data: pendingBids
    })
  } catch (error) {
    console.error('Error generating resume:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error generating resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
