import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { MonthlyWinner } from '@/models/MonthlyWinner'

// GET monthly winners with optional year filter
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    
    let query: any = {}
    
    if (year) {
      query.year = parseInt(year)
    }
    
    const winners = await MonthlyWinner.find(query)
      .sort({ year: -1, month: -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: winners })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create monthly winner
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const winner = await MonthlyWinner.create(body)
    
    return NextResponse.json({ success: true, data: winner }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
