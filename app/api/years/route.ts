import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Document } from '@/models/Document'

// GET available years from documents
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const years = await Document.distinct('year')
    const sortedYears = years.sort((a, b) => b - a)
    
    return NextResponse.json({ success: true, data: sortedYears })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
