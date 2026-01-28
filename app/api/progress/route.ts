import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Progress } from '@/models/Progress'

// GET progress data with optional year filter
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    
    let query: any = {}
    
    if (year) {
      query.year = parseInt(year)
    }
    
    const progress = await Progress.find(query)
      .sort({ year: -1, month: -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: progress })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create or update progress
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const progress = await Progress.create(body)
    
    return NextResponse.json({ success: true, data: progress }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
