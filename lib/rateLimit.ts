import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const now = Date.now()
  const key = `${ip}`

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key]
  }

  // Initialize or get existing record
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs
    }
  }

  store[key].count++

  const remaining = Math.max(0, limit - store[key].count)
  const success = store[key].count <= limit

  return { success, remaining }
}
