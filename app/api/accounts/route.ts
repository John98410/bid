import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Account from '@/models/Account'
import { verifyToken } from '@/lib/jwt'

// GET - Get user's accounts
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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
    
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Get all accounts for this user
    const accounts = await Account.find({ userId: decoded.userId }).sort({ isPrimary: -1, createdAt: -1 })

    return NextResponse.json({
      accounts: accounts.map(account => ({
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        address: account.address,
        education: account.education,
        companyHistory: account.companyHistory,
        extraNote: account.extraNote,
        skills: account.skills,
        currentRole: account.currentRole,
        isPrimary: account.isPrimary,
        styleSettings: account.styleSettings,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    }, { status: 200 })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new account
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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
    
    const { fullName, email, phoneNumber, address, education, companyHistory, extraNote, skills, currentRole, isPrimary, styleSettings } = await request.json()

    // Validation
    if (!fullName || !email) {
      return NextResponse.json(
        { message: 'Please provide full name and email' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary) {
      await Account.updateMany(
        { userId: decoded.userId, isPrimary: true },
        { isPrimary: false }
      )
    }

    // Create new account
    const account = await Account.create({
      userId: decoded.userId,
      fullName,
      email,
      phoneNumber: phoneNumber || '',
      address: address || '',
      education: education || '',
      companyHistory: companyHistory || '',
      extraNote: extraNote || '',
      skills: skills || [],
      currentRole: currentRole || '',
      isPrimary: isPrimary || false,
      styleSettings: styleSettings || {},
    })

    return NextResponse.json({
      message: 'Account created successfully',
      account: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        address: account.address,
        education: account.education,
        companyHistory: account.companyHistory,
        extraNote: account.extraNote,
        skills: account.skills,
        currentRole: account.currentRole,
        isPrimary: account.isPrimary,
        styleSettings: account.styleSettings,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update account information
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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
    
    const { accountId, fullName, email, phoneNumber, address, education, companyHistory, extraNote, skills, currentRole, isPrimary, styleSettings } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        { message: 'Account ID is required' },
        { status: 400 }
      )
    }

    const account = await Account.findOne({ _id: accountId, userId: decoded.userId })
    
    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      )
    }

    // If setting as primary, unset other primary accounts
    if (isPrimary && !account.isPrimary) {
      await Account.updateMany(
        { userId: decoded.userId, isPrimary: true },
        { isPrimary: false }
      )
    }
    
    // Update account fields
    if (fullName) account.fullName = fullName
    if (email) account.email = email
    if (phoneNumber !== undefined) account.phoneNumber = phoneNumber
    if (address !== undefined) account.address = address
    if (education !== undefined) account.education = education
    if (companyHistory !== undefined) account.companyHistory = companyHistory
    if (extraNote !== undefined) account.extraNote = extraNote
    if (skills !== undefined) account.skills = skills
    if (currentRole !== undefined) account.currentRole = currentRole
    if (isPrimary !== undefined) account.isPrimary = isPrimary
    if (styleSettings !== undefined) {
      // Validate style settings if provided
      const validColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      const validFonts = [
        'Arial, sans-serif',
        'Helvetica, sans-serif', 
        'Times New Roman, serif',
        'Georgia, serif',
        'Verdana, sans-serif',
        'Courier New, monospace'
      ];
      const validLineHeights = ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0'];

      if (styleSettings.fullNameColor && !validColorRegex.test(styleSettings.fullNameColor)) {
        return NextResponse.json(
          { message: 'Invalid full name color format' },
          { status: 400 }
        )
      }
      if (styleSettings.currentRoleColor && !validColorRegex.test(styleSettings.currentRoleColor)) {
        return NextResponse.json(
          { message: 'Invalid Position Title Color format' },
          { status: 400 }
        )
      }
      if (styleSettings.textColor && !validColorRegex.test(styleSettings.textColor)) {
        return NextResponse.json(
          { message: 'Invalid text color format' },
          { status: 400 }
        )
      }
      if (styleSettings.bgColor && !validColorRegex.test(styleSettings.bgColor)) {
        return NextResponse.json(
          { message: 'Invalid background color format' },
          { status: 400 }
        )
      }
      if (styleSettings.headingFont && !validFonts.includes(styleSettings.headingFont)) {
        return NextResponse.json(
          { message: 'Invalid heading font' },
          { status: 400 }
        )
      }
      if (styleSettings.textFont && !validFonts.includes(styleSettings.textFont)) {
        return NextResponse.json(
          { message: 'Invalid text font' },
          { status: 400 }
        )
      }
      if (styleSettings.lineHeight && !validLineHeights.includes(styleSettings.lineHeight)) {
        return NextResponse.json(
          { message: 'Invalid line height' },
          { status: 400 }
        )
      }

      account.styleSettings = { 
        ...(account.styleSettings || {}), 
        ...styleSettings 
      }
    }
    

    await account.save()

    return NextResponse.json({
      message: 'Account updated successfully',
      account: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        address: account.address,
        education: account.education,
        companyHistory: account.companyHistory,
        extraNote: account.extraNote,
        skills: account.skills,
        currentRole: account.currentRole,
        isPrimary: account.isPrimary,
        styleSettings: account.styleSettings,
        updatedAt: account.updatedAt,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update only style settings for an account
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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
    
    const { accountId, styleSettings } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        { message: 'Account ID is required' },
        { status: 400 }
      )
    }

    if (!styleSettings) {
      return NextResponse.json(
        { message: 'Style settings are required' },
        { status: 400 }
      )
    }

    // Validate style settings
    const validColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const validFonts = [
      'Arial, sans-serif',
      'Helvetica, sans-serif', 
      'Times New Roman, serif',
      'Georgia, serif',
      'Verdana, sans-serif',
      'Courier New, monospace'
    ];
    const validLineHeights = ['1.0', '1.2', '1.4', '1.5', '1.6', '1.8', '2.0'];

    if (styleSettings.fullNameColor && !validColorRegex.test(styleSettings.fullNameColor)) {
      return NextResponse.json(
        { message: 'Invalid full name color format' },
        { status: 400 }
      )
    }
    if (styleSettings.currentRoleColor && !validColorRegex.test(styleSettings.currentRoleColor)) {
      return NextResponse.json(
        { message: 'Invalid Position Title Color format' },
        { status: 400 }
      )
    }
    if (styleSettings.textColor && !validColorRegex.test(styleSettings.textColor)) {
      return NextResponse.json(
        { message: 'Invalid text color format' },
        { status: 400 }
      )
    }
    if (styleSettings.bgColor && !validColorRegex.test(styleSettings.bgColor)) {
      return NextResponse.json(
        { message: 'Invalid background color format' },
        { status: 400 }
      )
    }
    if (styleSettings.headingFont && !validFonts.includes(styleSettings.headingFont)) {
      return NextResponse.json(
        { message: 'Invalid heading font' },
        { status: 400 }
      )
    }
    if (styleSettings.textFont && !validFonts.includes(styleSettings.textFont)) {
      return NextResponse.json(
        { message: 'Invalid text font' },
        { status: 400 }
      )
    }
    if (styleSettings.lineHeight && !validLineHeights.includes(styleSettings.lineHeight)) {
      return NextResponse.json(
        { message: 'Invalid line height' },
        { status: 400 }
      )
    }

    const account = await Account.findOne({ _id: accountId, userId: decoded.userId })
    
    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      )
    }

    // Update only style settings
    account.styleSettings = { 
      ...(account.styleSettings || {}), 
      ...styleSettings 
    }

    await account.save()

    return NextResponse.json({
      message: 'Style settings updated successfully',
      styleSettings: account.styleSettings,
    }, { status: 200 })
  } catch (error) {
    console.error('Update style settings error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific account
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
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
    
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        { message: 'Account ID is required' },
        { status: 400 }
      )
    }

    const account = await Account.findOne({ _id: accountId, userId: decoded.userId })
    
    if (!account) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      )
    }

    await Account.findByIdAndDelete(accountId)

    return NextResponse.json({
      message: 'Account deleted successfully',
    }, { status: 200 })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
