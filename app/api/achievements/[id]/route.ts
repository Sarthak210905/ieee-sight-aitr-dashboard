import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AchievementSubmission } from '@/models/AchievementSubmission'
import { Member } from '@/models/Member'

// DELETE - Delete own pending submission (Member only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID required' },
        { status: 400 }
      )
    }
    
    const submission = await AchievementSubmission.findById(id)
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }
    
    // Check if the submission belongs to this member
    if (submission.memberId.toString() !== memberId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own submissions' },
        { status: 403 }
      )
    }
    
    // Only allow deletion of pending submissions
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Only pending submissions can be deleted' },
        { status: 400 }
      )
    }
    
    await AchievementSubmission.findByIdAndDelete(id)
    
    return NextResponse.json({ success: true, message: 'Submission deleted' })
  } catch (error: any) {
    console.error('Error deleting submission:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Approve or reject submission (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const body = await request.json()
    const { status, adminComment } = body
    
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const submission = await AchievementSubmission.findById(id)
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }
    
    // Update submission status
    submission.status = status
    submission.adminComment = adminComment
    submission.reviewedAt = new Date()
    await submission.save()
    
    // If approved, add achievement to member and update points
    if (status === 'approved') {
      const member = await Member.findById(submission.memberId)
      
      if (member) {
        // Add achievement to member
        member.achievements.push({
          id: submission._id.toString(),
          title: submission.title,
          description: submission.description,
          date: new Date(),
          category: submission.category,
          icon: getCategoryIcon(submission.category),
        })
        
        // Update points
        member.points = (member.points || 0) + submission.points
        
        // Update contributions count
        member.contributions = (member.contributions || 0) + 1
        
        // If event category, also update eventsAttended
        if (submission.category === 'event') {
          member.eventsAttended = (member.eventsAttended || 0) + 1
        }
        
        await member.save()
      }
    }
    
    return NextResponse.json({ success: true, data: submission })
  } catch (error: any) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'event': return '🎪'
    case 'contribution': return '✍️'
    case 'leadership': return '🎯'
    case 'excellence': return '⭐'
    default: return '🏆'
  }
}
