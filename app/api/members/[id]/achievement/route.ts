import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const achievement = await request.json()

    const member = await Member.findById(id)
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    member.achievements.push(achievement)
    await member.save()

    return NextResponse.json({ success: true, data: member })
  } catch (error: any) {
    console.error('Error adding achievement:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add achievement' },
      { status: 500 }
    )
  }
}
