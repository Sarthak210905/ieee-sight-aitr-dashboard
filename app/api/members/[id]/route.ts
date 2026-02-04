import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'

// GET single member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const member = await Member.findById(id).lean()
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }
    
    // Don't send password
    const { password, ...memberData } = member as any
    // Ensure role is present
    if (!memberData.role) memberData.role = 'member'
    return NextResponse.json({ success: true, data: memberData })
  } catch (error: any) {
    console.error('Error fetching member:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const body = await request.json()
    const { eventsAttended, contributions, points, bio, profileImage } = body

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      {
        ...(eventsAttended !== undefined && { eventsAttended }),
        ...(contributions !== undefined && { contributions }),
        ...(points !== undefined && { points }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
      },
      { new: true, runValidators: true }
    )

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }
    
    // Don't send password
    const memberObj = updatedMember.toObject()
    const { password, ...memberData } = memberObj as any
    // Ensure role is present
    if (!memberData.role) memberData.role = 'member'
    return NextResponse.json({ success: true, data: memberData })
  } catch (error: any) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const deletedMember = await Member.findByIdAndDelete(id)

    if (!deletedMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: deletedMember })
  } catch (error: any) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete member' },
      { status: 500 }
    )
  }
}
