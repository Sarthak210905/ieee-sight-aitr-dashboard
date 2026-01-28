import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Document } from '@/models/Document'
import { googleDriveService } from '@/lib/googleDrive'

// DELETE a document (member can only delete their own documents)
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
        { success: false, error: 'Only admin can delete documents' },
        { status: 403 }
      )
    }
    const document = await Document.findById(params.id)
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }
    try {
      await googleDriveService.deleteFile(document.driveFileId)
    } catch (error) {
      console.error('Error deleting from Google Drive:', error)
    }
    await Document.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET a single document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const document = await Document.findById(params.id).lean()
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: document })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
