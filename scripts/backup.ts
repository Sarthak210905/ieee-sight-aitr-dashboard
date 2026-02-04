/**
 * Database backup utility
 * Run: node scripts/backup.js
 */

import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

const MONGODB_URI = process.env.MONGODB_URI!

async function backup() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI)
  
  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    
    const db = client.db()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups', timestamp)
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    console.log('📦 Starting backup...')
    
    const collections = await db.listCollections().toArray()
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      console.log(`  ├─ Backing up ${collectionName}...`)
      
      const collection = db.collection(collectionName)
      const documents = await collection.find({}).toArray()
      
      const filePath = path.join(backupDir, `${collectionName}.json`)
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2))
      
      console.log(`  ✓ Saved ${documents.length} documents`)
    }
    
    // Save metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      collections: collections.length,
      database: db.databaseName
    }
    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )
    
    console.log(`\n✅ Backup completed successfully!`)
    console.log(`📁 Location: ${backupDir}`)
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

backup()
