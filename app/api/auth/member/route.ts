import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'
import crypto from 'crypto'

// Simple password hashing (for production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { action, email, password, name, branch, year } = body
    
    if (action === 'login') {
      // Login
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        )
      }
      
      const member = await Member.findOne({ email: email.toLowerCase() })
      
      if (!member) {
        return NextResponse.json(
          { success: false, error: 'Member not found. Please register first.' },
          { status: 401 }
        )
      }
      
      if (!member.password) {
        return NextResponse.json(
          { success: false, error: 'Password not set. Please contact admin or register.' },
          { status: 401 }
        )
      }
      
      const hashedPassword = hashPassword(password)
      
      if (member.password !== hashedPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid password' },
          { status: 401 }
        )
      }
      
      // Return member data (without password)
      const memberData = {
        _id: member._id.toString(),
        name: member.name,
        email: member.email,
        branch: member.branch,
        year: member.year,
        points: member.points,
        profileImage: member.profileImage,
        role: member.role || 'member',
      }
      
      return NextResponse.json({ success: true, data: memberData })
      
    } else if (action === 'register') {
      // Register new member or set password for existing
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and password are required' },
          { status: 400 }
        )
      }
      
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }
      
      const existingMember = await Member.findOne({ email: email.toLowerCase() })
      
      if (existingMember) {
        // If member exists but has no password, set password
        if (!existingMember.password) {
          existingMember.password = hashPassword(password)
          await existingMember.save()
          
          const memberData = {
            _id: existingMember._id.toString(),
            name: existingMember.name,
            email: existingMember.email,
            branch: existingMember.branch,
            year: existingMember.year,
            points: existingMember.points,
            profileImage: existingMember.profileImage,
            role: existingMember.role || 'member',
          }
          
          return NextResponse.json({ success: true, data: memberData })
        }
        
        return NextResponse.json(
          { success: false, error: 'Email already registered. Please login.' },
          { status: 400 }
        )
      }
      
      // Create new member
      const newMember = await Member.create({
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        branch: branch || 'Not specified',
        year: year || 'Not specified',
        joinYear: new Date().getFullYear(),
        eventsAttended: 0,
        contributions: 0,
        achievements: [],
        points: 0,
        rank: 0,
        isActive: true,
      })
      
      const memberData = {
        _id: newMember._id.toString(),
        name: newMember.name,
        email: newMember.email,
        branch: newMember.branch,
        year: newMember.year,
        points: newMember.points,
        profileImage: newMember.profileImage,
        role: newMember.role || 'member',
      }
      
      return NextResponse.json({ success: true, data: memberData })
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
    
  } catch (error: any) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
