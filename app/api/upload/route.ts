import { NextRequest, NextResponse } from 'next/server'
import { googleDriveService } from '@/lib/googleDrive'
import connectDB from '@/lib/mongodb'
import { Document } from '@/models/Document'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to parse form data
async function parseFormData(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const uploadedBy = formData.get('uploadedBy') as string
  
  return { file, name, category, uploadedBy }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { file, name, category, uploadedBy } = await parseFormData(request)
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Google Drive
    const driveFile = await googleDriveService.uploadFile({
      fileName: file.name,
      mimeType: file.type,
      fileBuffer: buffer,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    })
    
    // Save to database
    const document = await Document.create({
      name: name || file.name,
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      uploadDate: new Date(),
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      category: category || 'document',
      year: new Date().getFullYear(),
      driveFileId: driveFile.id,
      driveFileLink: driveFile.webViewLink || '',
      uploadedBy: uploadedBy || '',
    })
    
    return NextResponse.json({ 
      success: true, 
      data: document,
      message: 'File uploaded successfully' 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
