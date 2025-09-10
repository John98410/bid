import { NextRequest, NextResponse } from 'next/server';
import PendingBid from '../../../models/PendingBid';
import dbConnect from '../../../lib/mongodb';
import path from 'path';
import fs from 'fs';
import { generateResumePDFBuffer } from '@/lib/resume-generator';
import Account from '@/models/Account';
import { verifyToken } from '@/lib/jwt';
import Bid from '@/models/Bid';
export async function GET(request: NextRequest) {
  await dbConnect();
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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const total = await PendingBid.countDocuments();
  const data = await PendingBid.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const bid = await PendingBid.findById(id);
  if (!bid) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Remove resume file
  const resumePath = path.join(process.cwd(), 'public', 'auto_generated_resumes', bid.resumeFileName);
  try {
    fs.unlinkSync(resumePath);
  } catch (e) {
    // File may not exist, ignore
  }

  await PendingBid.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
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

    const { id, action } = await request.json()
    const bid = await PendingBid.findById(id);
    // if (!bid) return NextResponse.json({ error: 'Not found' }, { status: 200 });
    if (action === "update") {
      let account = await Account.findById(bid.account_id);
      // if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      let pdfBuffer = await generateResumePDFBuffer(bid.jobTitle, bid.jobDescription, account);
      const resumePath = path.join(process.cwd(), 'public', 'auto_generated_resumes', bid.resumeFileName);

      fs.unlinkSync(resumePath);
      fs.writeFileSync(resumePath, pdfBuffer);
      console.log('PDF is updated to:', resumePath)
    } else {
      await Bid.create({
        userId: decoded.userId,
        accountId: bid.account_id,
        jobTitle: bid.jobTitle,
        companyName: bid.companyName,
        jobDescription: bid.jobDescription,
        link: bid.link,
        resumeFileName: bid.resumeFileName,
      });
      await PendingBid.deleteOne({ _id: id });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}