import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Document } from '@/models/Document'

// GET all documents with optional year filter
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    
    let query: any = {}
    
    if (year) {
      query.year = parseInt(year)
    }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    const documents = await Document.find(query)
      .sort({ uploadDate: -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: documents })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new document
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const document = await Document.create({
      ...body,
      year: body.year || new Date().getFullYear(),
    })
    
    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
