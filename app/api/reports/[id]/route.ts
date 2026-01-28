import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Report } from '@/models/Report'

// DELETE - Member can delete their own reports (only if status is 'open')
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('isAdmin') === 'true'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admin can delete reports' },
        { status: 403 }
      )
    }
    const report = await Report.findById(params.id)
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }
    await Report.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Report deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Update report status and add response (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { status, adminResponse } = body
    
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolvedAt = new Date()
      }
    }
    
    if (adminResponse) {
      updateData.adminResponse = adminResponse
    }
    
    const report = await Report.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: report })
  } catch (error: any) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
