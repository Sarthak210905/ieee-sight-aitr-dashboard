import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Event } from '@/models/Event'

// GET all events
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming')
    
    const query: any = { isPublic: true }
    
    if (year) {
      query.year = parseInt(year)
    }
    
    if (status) {
      query.status = status
    }
    
    if (type) {
      query.type = type
    }
    
    if (upcoming === 'true') {
      query.date = { $gte: new Date() }
      query.status = { $in: ['upcoming', 'ongoing'] }
    }
    
    const events = await Event.find(query)
      .sort({ date: upcoming === 'true' ? 1 : -1 })
      .lean()
    
    return NextResponse.json({ success: true, data: events })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST create new event (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { title, description, date, endDate, time, location, type, registrationLink, maxParticipants, organizer } = body
    
    if (!title || !description || !date || !location || !type || !organizer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const eventDate = new Date(date)
    
    const event = await Event.create({
      title,
      description,
      date: eventDate,
      endDate: endDate ? new Date(endDate) : undefined,
      time,
      location,
      type,
      status: eventDate > new Date() ? 'upcoming' : 'ongoing',
      registrationLink,
      maxParticipants,
      currentParticipants: 0,
      organizer,
      isPublic: true,
      year: eventDate.getFullYear(),
    })
    
    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
