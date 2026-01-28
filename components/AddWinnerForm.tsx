'use client'

import { useState, useEffect } from 'react'
import { X, Trophy } from 'lucide-react'

interface AddWinnerFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function AddWinnerForm({ isOpen, onClose, onSuccess }: AddWinnerFormProps) {
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    winnerId: '',
    category: 'overall',
    reason: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members?year=${formData.year}`)
      const result = await response.json()
      if (result.success) {
        setMembers(result.data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.winnerId || !formData.month) {
      alert('Please fill all required fields')
      return
    }

    setLoading(true)

    try {
      const winner = members.find(m => m._id === formData.winnerId)
      
      if (!winner) {
        alert('Selected member not found')
        setLoading(false)
        return
      }

      // Get top 3 members for the leaderboard
      const topThree = members.slice(0, 3).map((m, index) => ({
        rank: index + 1,
        name: m.name,
        memberId: m._id,
        points: m.points || 0
      }))
      
      const response = await fetch('/api/winners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: formData.month,
          year: formData.year,
          winner: {
            name: winner.name,
            memberId: winner._id,
            points: winner.points || 0,
            eventsAttended: winner.eventsAttended || 0,
            contributions: winner.contributions || 0
          },
          topThree: topThree
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Winner declared successfully!')
        setFormData({
          month: '',
          year: new Date().getFullYear(),
          winnerId: '',
          category: 'overall',
          reason: ''
        })
        onSuccess()
        onClose()
      } else {
        alert('Failed to declare winner: ' + result.error)
      }
    } catch (error) {
      console.error('Error declaring winner:', error)
      alert('Failed to declare winner')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Declare Monthly Winner
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              >
                <option value="">Select Month</option>
                {MONTHS.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => {
                  const year = parseInt(e.target.value) || new Date().getFullYear()
                  setFormData({ ...formData, year })
                  fetchMembers()
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                min="2020"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Winner *
            </label>
            <select
              required
              value={formData.winnerId}
              onChange={(e) => setFormData({ ...formData, winnerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            >
              <option value="">Select Winner</option>
              {members
                .sort((a, b) => b.points - a.points)
                .map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.points} pts (Rank #{member.rank})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            >
              <option value="overall">🏆 Overall Performance</option>
              <option value="events">🎪 Event Participation</option>
              <option value="contributions">✍️ Contributions</option>
              <option value="leadership">🎯 Leadership</option>
              <option value="improvement">📈 Most Improved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              rows={3}
              placeholder="Why did this member win? (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-400"
            >
              {loading ? 'Declaring...' : '🏆 Declare Winner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
