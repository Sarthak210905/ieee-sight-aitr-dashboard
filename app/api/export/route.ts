import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Member } from '@/models/Member'
import { MonthlyWinner } from '@/models/MonthlyWinner'
import { AchievementSubmission } from '@/models/AchievementSubmission'

// GET - Export data in various formats
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'members'
    const format = searchParams.get('format') || 'json'
    const year = searchParams.get('year')
    
    let data: any[] = []
    let headers: string[] = []
    let filename = ''
    
    switch (type) {
      case 'members':
        const members = await Member.find({}).sort({ points: -1 }).lean()
        data = members.map((m: any, index) => ({
          rank: index + 1,
          name: m.name,
          email: m.email,
          branch: m.branch,
          year: m.year,
          points: m.points || 0,
          eventsAttended: m.eventsAttended || 0,
          contributions: m.contributions || 0,
          achievementsCount: m.achievements?.length || 0,
          joinYear: m.joinYear,
        }))
        headers = ['Rank', 'Name', 'Email', 'Branch', 'Year', 'Points', 'Events', 'Contributions', 'Achievements', 'Join Year']
        filename = 'ieee-sight-members'
        break
        
      case 'leaderboard':
        const leaderboard = await Member.find({})
          .sort({ points: -1 })
          .limit(50)
          .lean()
        data = leaderboard.map((m: any, index) => ({
          rank: index + 1,
          name: m.name,
          branch: m.branch,
          points: m.points || 0,
          eventsAttended: m.eventsAttended || 0,
          contributions: m.contributions || 0,
        }))
        headers = ['Rank', 'Name', 'Branch', 'Points', 'Events', 'Contributions']
        filename = 'ieee-sight-leaderboard'
        break
        
      case 'winners':
        const winnersQuery: any = {}
        if (year) winnersQuery.year = parseInt(year)
        const winners = await MonthlyWinner.find(winnersQuery)
          .sort({ year: -1, month: -1 })
          .lean()
        data = winners.map((w: any) => ({
          month: w.month,
          year: w.year,
          winnerName: w.winner.name,
          winnerPoints: w.winner.points,
          runnerUp1: w.topThree[1]?.name || '-',
          runnerUp2: w.topThree[2]?.name || '-',
        }))
        headers = ['Month', 'Year', 'Winner', 'Points', 'Runner Up 1', 'Runner Up 2']
        filename = `ieee-sight-winners${year ? `-${year}` : ''}`
        break
        
      case 'achievements':
        const status = searchParams.get('status')
        const achievementsQuery: any = {}
        if (status) achievementsQuery.status = status
        const achievements = await AchievementSubmission.find(achievementsQuery)
          .sort({ submittedAt: -1 })
          .lean()
        data = achievements.map((a: any) => ({
          memberName: a.memberName,
          title: a.title,
          category: a.category,
          points: a.points,
          status: a.status,
          submittedAt: new Date(a.submittedAt).toLocaleDateString(),
          reviewedAt: a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString() : '-',
        }))
        headers = ['Member', 'Title', 'Category', 'Points', 'Status', 'Submitted', 'Reviewed']
        filename = `ieee-sight-achievements${status ? `-${status}` : ''}`
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        )
    }
    
    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(headers, data)
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    }
    
    // Return JSON by default (can be used by frontend to generate PDF)
    return NextResponse.json({
      success: true,
      data,
      headers,
      filename,
      exportedAt: new Date().toISOString(),
    })
    
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function generateCSV(headers: string[], data: any[]): string {
  const headerRow = headers.join(',')
  const dataRows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}
