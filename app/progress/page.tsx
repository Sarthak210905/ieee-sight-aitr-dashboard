'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target, CheckCircle, BarChart3, Plus } from 'lucide-react'
import AddProgressForm from '@/components/AddProgressForm'
import { useAdmin } from '@/contexts/AdminContext'

interface ProgressData {
  month: string
  events: number
  members: number
  documents: number
  target: number
}

export default function ProgressPage() {
  const { isAdmin } = useAdmin()
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [selectedYear, setSelectedYear] = useState('2026')
  const [availableYears, setAvailableYears] = useState<string[]>(['2026', '2025'])
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchProgress()
  }, [selectedYear])

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress?year=${selectedYear}`)
      const result = await response.json()
      
      if (result.success) {
        setProgress(result.data)
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const currentMonth = progress[0] || { month: 'Jan 2026', events: 0, members: 0, documents: 0, target: 5 }
  const totalEvents = progress.reduce((sum, p) => sum + p.events, 0)
  const totalDocs = progress.reduce((sum, p) => sum + p.documents, 0)
  const avgCompletion = progress.length > 0 
    ? Math.round((progress.reduce((sum, p) => sum + (p.events / p.target * 100), 0) / progress.length))
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-ieee-blue">
              Progress Tracking
            </h1>
            <p className="text-gray-600">
              Monitor your activities and achievements over time
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-ieee-blue text-white px-4 py-2 rounded-lg hover:bg-ieee-light transition"
            >
              <Plus size={20} />
              Add Progress
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">This Month</span>
          </div>
          <p className="text-3xl font-bold mb-1">{currentMonth.events}</p>
          <p className="text-sm opacity-90">Events Organized</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target size={24} />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Overall</span>
          </div>
          <p className="text-3xl font-bold mb-1">{totalEvents}</p>
          <p className="text-sm opacity-90">Total Events</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Average</span>
          </div>
          <p className="text-3xl font-bold mb-1">{avgCompletion}%</p>
          <p className="text-sm opacity-90">Target Completion</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 size={24} />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-3xl font-bold mb-1">{currentMonth.members}</p>
          <p className="text-sm opacity-90">Active Members</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Monthly Progress</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          {progress.map((item, index) => {
            const completionRate = (item.events / item.target) * 100
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.month}</span>
                  <span className="text-sm text-gray-500">{item.events}/{item.target} events</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completionRate >= 100 ? 'bg-green-500' :
                      completionRate >= 60 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-ieee-blue" />
            Events Timeline
          </h3>
          <div className="space-y-3">
            {progress.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{item.month}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600 font-semibold">{item.events} events</span>
                  <span className="text-green-600 font-semibold">{item.documents} docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-ieee-blue" />
            Member Growth
          </h3>
          <div className="space-y-3">
            {progress.slice(0, 4).map((item, index) => {
              const prevMembers = progress[index + 1]?.members || item.members
              const growth = item.members - prevMembers
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">{item.members}</span>
                    {growth > 0 && (
                      <span className="text-xs text-green-600 font-semibold">+{growth}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Progress Form */}
      <AddProgressForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={fetchProgress}
      />
    </div>
  )
}
