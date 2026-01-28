import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Report } from '@/models/Report'

// GET - Get reports (Admin: all, Member: own reports)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')
    const isAdmin = searchParams.get('admin') === 'true'
    
    const query: any = {}
    
    if (!isAdmin && memberId) {
      query.reporterId = memberId
    }
    
    if (status) {
      query.status = status
    }
    
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: reports })
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { reporterId, reporterName, reporterEmail, type, subject, description, relatedTo } = body
    
    if (!reporterId || !reporterName || !reporterEmail || !type || !subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const report = await Report.create({
      reporterId,
      reporterName,
      reporterEmail,
      type,
      subject,
      description,
      relatedTo,
      status: 'open',
      priority: 'medium',
      createdAt: new Date(),
    })
    
    return NextResponse.json({ success: true, data: report })
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
