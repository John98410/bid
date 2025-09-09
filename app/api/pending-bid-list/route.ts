import { NextRequest, NextResponse } from 'next/server';
import PendingBid from '../../../models/PendingBid';
import dbConnect from '../../../lib/mongodb';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: NextRequest) {
  await dbConnect();
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const bid = await PendingBid.findById(id);
  if (!bid) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Remove resume file
  const resumePath = path.join(process.cwd(), 'public', 'auto_generated_resumes', bid.resumeFileName);
  try {
    await fs.unlink(resumePath);
  } catch (e) {
    // File may not exist, ignore
  }

  await PendingBid.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
