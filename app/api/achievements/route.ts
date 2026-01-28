import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AchievementSubmission } from '@/models/AchievementSubmission'
import { Member } from '@/models/Member'

// GET all submissions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const memberId = searchParams.get('memberId')
    
    let query: any = {}
    
    if (status) {
      query.status = status
    }
    
    if (memberId) {
      query.memberId = memberId
    }
    
    const submissions = await AchievementSubmission.find(query)
      .sort({ submittedAt: -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: submissions })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Submit new achievement for review
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    // Verify member exists
    const member = await Member.findById(body.memberId)
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }
    
    const submission = await AchievementSubmission.create({
      memberId: body.memberId,
      memberName: member.name,
      memberEmail: member.email,
      title: body.title,
      description: body.description,
      category: body.category,
      proof: body.proof,
      points: body.points || 10,
      status: 'pending',
      submittedAt: new Date(),
    })
    
    return NextResponse.json({ success: true, data: submission }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
