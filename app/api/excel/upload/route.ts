import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { headers } from 'next/headers'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

interface JobData {
  jobTitle: string
  companyName: string
  jobDescription: string
  link: string
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

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('excelFile') as File
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { message: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0] // Get first sheet
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Parse data according to specified structure
    const jobData: JobData[] = []
    
    // Skip header row if it exists, start from index 1
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue
      
      const job: JobData = {
        jobTitle: row[0]?.toString().trim() || '',
        companyName: row[1]?.toString().trim() || '',
        jobDescription: row[2]?.toString().trim() || '',
        link: row[3]?.toString().trim() || ''
      }
      
      // Only add if job title exists
      if (job.jobTitle) {
        jobData.push(job)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Excel file processed successfully',
      data: jobData,
      totalJobs: jobData.length
    })

  } catch (error) {
    console.error('Error processing Excel file:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error processing Excel file',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

