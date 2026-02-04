import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'

export async function GET() {
  try {
    // Check database connection
    const dbStart = Date.now()
    await dbConnect()
    const dbLatency = Date.now() - dbStart

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbLatency < 1000 ? 'healthy' : 'degraded',
        latency: dbLatency
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
