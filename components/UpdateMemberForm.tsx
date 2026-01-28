'use client'

import { useState } from 'react'
import { X, Award } from 'lucide-react'

interface Member {
  _id?: string
  name: string
  eventsAttended: number
  contributions: number
  points: number
}

interface UpdateMemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  member: Member | null
}

const ACHIEVEMENT_CATEGORIES = [
  { value: 'event', label: 'Event', icon: '🎪' },
  { value: 'contribution', label: 'Contribution', icon: '✍️' },
  { value: 'leadership', label: 'Leadership', icon: '🎯' },
  { value: 'excellence', label: 'Excellence', icon: '⭐' },
]

const ACHIEVEMENT_ICONS = ['🏆', '🎯', '⭐', '🎪', '✍️', '👥', '🌟', '📅', '🎉', '💡']

export default function UpdateMemberForm({ isOpen, onClose, onSuccess, member }: UpdateMemberFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventsAttended: 0,
    contributions: 0,
    pointsToAdd: 0
  })
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    category: 'event',
    icon: '🏆'
  })

  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member?._id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/members/${member._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventsAttended: member.eventsAttended + formData.eventsAttended,
          contributions: member.contributions + formData.contributions,
          points: member.points + formData.pointsToAdd,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Member stats updated successfully!')
        setFormData({ eventsAttended: 0, contributions: 0, pointsToAdd: 0 })
        onSuccess()
      } else {
        alert('Failed to update: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating member:', error)
      alert('Failed to update member')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member?._id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/members/${member._id}/achievement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...achievementData,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Achievement added successfully!')
        setAchievementData({
          title: '',
          description: '',
          category: 'event',
          icon: '🏆'
        })
        onSuccess()
      } else {
        alert('Failed to add achievement: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding achievement:', error)
      alert('Failed to add achievement')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Update {member.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Update Stats */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-ieee-blue" />
              Update Statistics
            </h3>
            <form onSubmit={handleUpdateStats} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Events
                  </label>
                  <input
                    type="number"
                    value={formData.eventsAttended}
                    onChange={(e) => setFormData({ ...formData, eventsAttended: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {member.eventsAttended}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Contributions
                  </label>
                  <input
                    type="number"
                    value={formData.contributions}
                    onChange={(e) => setFormData({ ...formData, contributions: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {member.contributions}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Points
                  </label>
                  <input
                    type="number"
                    value={formData.pointsToAdd}
                    onChange={(e) => setFormData({ ...formData, pointsToAdd: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {member.points}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Updating...' : 'Update Statistics'}
              </button>
            </form>
          </div>

          {/* Add Achievement */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Achievement</h3>
            <form onSubmit={handleAddAchievement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={achievementData.title}
                  onChange={(e) => setAchievementData({ ...achievementData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Best Contributor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={achievementData.description}
                  onChange={(e) => setAchievementData({ ...achievementData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  rows={3}
                  placeholder="Describe the achievement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={achievementData.category}
                    onChange={(e) => setAchievementData({ ...achievementData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  >
                    {ACHIEVEMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    value={achievementData.icon}
                    onChange={(e) => setAchievementData({ ...achievementData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  >
                    {ACHIEVEMENT_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Achievement'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
