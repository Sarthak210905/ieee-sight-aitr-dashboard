'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, TrendingUp, Award, Calendar, Crown, Star, Plus, AlertCircle, Loader2 } from 'lucide-react'
import AddWinnerForm from '@/components/AddWinnerForm'
import ExportButton from '@/components/ExportButton'
import { useAdmin } from '@/contexts/AdminContext'

interface MonthlyWinner {
  month: string
  year: number
  winner: {
    name: string
    points: number
    eventsAttended: number
    contributions: number
  }
  topThree: Array<{
    rank: number
    name: string
    points: number
  }>
}

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  eventsAttended: number
  contributions: number
  trend: 'up' | 'down' | 'same'
  change: number
}

export default function LeaderboardPage() {
  const { isAdmin } = useAdmin()
  const [currentLeaderboard, setCurrentLeaderboard] = useState<LeaderboardEntry[]>([])
  const [monthlyWinners, setMonthlyWinners] = useState<MonthlyWinner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showAddWinnerForm, setShowAddWinnerForm] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
    fetchMonthlyWinners()
  }, [selectedYear])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const result = await response.json()
      
      if (result.success) {
        setCurrentLeaderboard(result.data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const fetchMonthlyWinners = async () => {
    try {
      const response = await fetch(`/api/winners?year=${selectedYear}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        setMonthlyWinners(result.data)
        setSelectedMonth(`${result.data[0].month} ${result.data[0].year}`)
      }
    } catch (error) {
      console.error('Error fetching winners:', error)
    }
  }

  const selectedWinnerData = monthlyWinners.find(
    w => `${w.month} ${w.year}` === selectedMonth
  )

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />
    if (trend === 'down') return <TrendingUp size={16} className="text-red-500 transform rotate-180" />
    return <span className="text-gray-400">—</span>
  }

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500'
    if (rank === 2) return 'from-gray-300 to-gray-400'
    if (rank === 3) return 'from-orange-400 to-orange-500'
    return 'from-blue-400 to-blue-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ieee-blue mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-600">
              Monthly winners and current rankings
            </p>
          </div>
          <ExportButton type="leaderboard" label="Export Leaderboard" />
        </div>
      </div>

      {/* Current Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentLeaderboard.slice(0, 3).map((entry) => (
          <div
            key={entry.rank}
            className={`bg-gradient-to-br ${getMedalColor(entry.rank)} rounded-lg shadow-xl p-6 text-white transform hover:scale-105 transition`}
          >
            <div className="flex items-center justify-between mb-4">
              <Crown size={32} />
              <span className="text-5xl font-bold opacity-20">#{entry.rank}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{entry.name}</h3>
            <div className="bg-white/20 rounded-lg p-4 mb-3">
              <p className="text-3xl font-bold mb-1">{entry.points}</p>
              <p className="text-sm opacity-90">Total Points</p>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <p className="opacity-75">Events</p>
                <p className="font-bold">{entry.eventsAttended}</p>
              </div>
              <div>
                <p className="opacity-75">Contributions</p>
                <p className="font-bold">{entry.contributions}</p>
              </div>
              <div>
                <p className="opacity-75">Trend</p>
                <div className="flex items-center gap-1 font-bold">
                  {getTrendIcon(entry.trend)}
                  {entry.change !== 0 && Math.abs(entry.change)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-ieee-blue" />
            Current Standings
          </h2>
          <span className="text-sm text-gray-500">Updated: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Rank</th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Name</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Points</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Events</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Contributions</th>
                <th className="text-center py-3 px-4 text-gray-600 font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody>
              {currentLeaderboard.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                    entry.rank <= 3 ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && <Trophy size={20} className="text-yellow-500" />}
                      <span className="font-bold text-lg text-gray-800">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-ieee-blue rounded-full flex items-center justify-center text-white font-bold">
                        {entry.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">{entry.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-ieee-blue text-lg">{entry.points}</span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    {entry.eventsAttended}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">
                    {entry.contributions}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {getTrendIcon(entry.trend)}
                      {entry.change !== 0 && (
                        <span className={`text-sm font-semibold ${
                          entry.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Winners */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-ieee-blue" />
            Monthly Winners
          </h2>
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowAddWinnerForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                <Trophy size={18} />
                Declare Winner
              </button>
            )}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            >
              {monthlyWinners.map((winner) => (
                <option key={`${winner.month}-${winner.year}`} value={`${winner.month} ${winner.year}`}>
                  {winner.month} {winner.year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedWinnerData && (
          <div>
            {/* Winner Highlight */}
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-xl p-8 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown size={48} />
                  <div>
                    <p className="text-sm opacity-90 mb-1">Winner of {selectedWinnerData.month} {selectedWinnerData.year}</p>
                    <h3 className="text-3xl font-bold mb-2">{selectedWinnerData.winner.name}</h3>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="opacity-75">Points</p>
                        <p className="font-bold text-lg">{selectedWinnerData.winner.points}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Events</p>
                        <p className="font-bold text-lg">{selectedWinnerData.winner.eventsAttended}</p>
                      </div>
                      <div>
                        <p className="opacity-75">Contributions</p>
                        <p className="font-bold text-lg">{selectedWinnerData.winner.contributions}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Trophy size={64} className="opacity-50" />
              </div>
            </div>

            {/* Top 3 of the Month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedWinnerData.topThree.map((entry) => (
                <div
                  key={entry.rank}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-500' :
                      entry.rank === 2 ? 'text-gray-400' :
                      'text-orange-500'
                    }`}>
                      #{entry.rank}
                    </span>
                    <Award size={24} className={
                      entry.rank === 1 ? 'text-yellow-500' :
                      entry.rank === 2 ? 'text-gray-400' :
                      'text-orange-500'
                    } />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{entry.name}</h4>
                  <p className="text-lg font-semibold text-ieee-blue">{entry.points} points</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Winner Form */}
      <AddWinnerForm
        isOpen={showAddWinnerForm}
        onClose={() => setShowAddWinnerForm(false)}
        onSuccess={() => {
          fetchMonthlyWinners()
          setShowAddWinnerForm(false)
        }}
      />
    </div>
  )
}
