/**
 * Environment variable validation
 * Run this at startup to ensure all required variables are present
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_DRIVE_FOLDER_ID',
  'NEXTAUTH_SECRET'
]

export function validateEnv() {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(v => console.error(`   - ${v}`))
    console.error('\n📝 Please check your .env file')
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables in production')
    }
  } else {
    console.log('✅ All required environment variables are set')
  }
}

// Validate on module import
if (typeof window === 'undefined') {
  validateEnv()
}
