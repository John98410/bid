import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { verifyToken } from '@/lib/jwt'
import Bid from '@/models/Bid'
import Account from '@/models/Account'
export const dynamic = 'force-dynamic';

// GET /api/statistics - Get dashboard statistics for the authenticated user
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

    const userId = decoded.userId

    // Get total counts
    const totalBids = await Bid.countDocuments({ userId })
    const totalAccounts = await Account.countDocuments({ userId })

    // Get bids from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentBids = await Bid.countDocuments({ 
      userId, 
      createdAt: { $gte: thirtyDaysAgo } 
    })

    // Get bids from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const weeklyBids = await Bid.countDocuments({ 
      userId, 
      createdAt: { $gte: sevenDaysAgo } 
    })

    // Get bids created today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const todayBids = await Bid.countDocuments({ 
      userId, 
      createdAt: { $gte: today, $lt: tomorrow } 
    })

    // Get bids by account
    const bidsByAccount = await Bid.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'accounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'account'
        }
      },
      { $unwind: '$account' },
      {
        $group: {
          _id: '$accountId',
          accountName: { $first: '$account.fullName' },
          accountRole: { $first: '$account.currentRole' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    // Get bids by company
    const bidsByCompany = await Bid.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$companyName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    // Get monthly bid trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const monthlyTrends = await Bid.aggregate([
      { 
        $match: { 
          userId, 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get recent bids with account info
    const recentBidsList = await Bid.find({ userId })
      .populate('accountId', 'fullName currentRole')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName jobTitle createdAt accountId')

    // Calculate growth rates
    const previousMonth = new Date()
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    previousMonth.setDate(1)
    previousMonth.setHours(0, 0, 0, 0)
    
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const currentMonthBids = await Bid.countDocuments({
      userId,
      createdAt: { $gte: currentMonth }
    })

    const previousMonthBids = await Bid.countDocuments({
      userId,
      createdAt: { $gte: previousMonth, $lt: currentMonth }
    })

    const monthlyGrowthRate = previousMonthBids > 0 
      ? ((currentMonthBids - previousMonthBids) / previousMonthBids) * 100 
      : currentMonthBids > 0 ? 100 : 0

    return NextResponse.json({
      overview: {
        totalBids,
        totalAccounts,
        recentBids,
        weeklyBids,
        todayBids,
        monthlyGrowthRate: Math.round(monthlyGrowthRate * 100) / 100
      },
      topAccounts: bidsByAccount,
      topCompanies: bidsByCompany,
      monthlyTrends: monthlyTrends.map(trend => ({
        month: `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`,
        count: trend.count
      })),
      recentBids: recentBidsList.map(bid => ({
        id: bid._id,
        companyName: bid.companyName,
        jobTitle: bid.jobTitle,
        createdAt: bid.createdAt,
        accountName: bid.accountId?.fullName || 'Unknown Account',
        accountRole: bid.accountId?.currentRole || ''
      }))
    }, { status: 200 })
  } catch (error) {
    console.error('Get statistics error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
