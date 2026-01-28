import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'ieee-sight-admin-2024'
    
    if (password === adminPassword) {
      // Generate a simple token
      const token = crypto.randomBytes(32).toString('hex')
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: 'Login successful'
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
