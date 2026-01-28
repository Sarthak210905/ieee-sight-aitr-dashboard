import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'

// GET current leaderboard
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const members = await Member.find({})
      .sort({ points: -1 })
      .limit(20)
      .lean()
    
    // Calculate trends (simplified - you can enhance this)
    const leaderboard = members.map((member: any, index) => ({
      rank: index + 1,
      name: member.name,
      memberId: member._id?.toString() || '',
      points: member.points,
      eventsAttended: member.eventsAttended,
      contributions: member.contributions,
      trend: 'same' as const,
      change: 0,
    }))
    
    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
