import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'

// GET all members with optional year filter
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const joinYear = searchParams.get('year')
    
    let query: any = {}
    
    if (joinYear) {
      query.joinYear = parseInt(joinYear)
    }
    
    const members = await Member.find(query)
      .sort({ points: -1 })
      .lean()
    
    // Update ranks
    const membersWithRank = members.map((member, index) => ({
      ...member,
      rank: index + 1,
    }))
    
    return NextResponse.json({ success: true, data: membersWithRank })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new member
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const member = await Member.create({
      ...body,
      joinYear: body.joinYear || new Date().getFullYear(),
    })
    
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
