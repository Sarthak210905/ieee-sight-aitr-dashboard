'use client'

import { useState, useEffect, useCallback } from 'react'
import { Award, Star, TrendingUp, Medal, Trophy, User, UserPlus, Edit, AlertCircle, Loader2 } from 'lucide-react'
import AddMemberForm from '@/components/AddMemberForm'
import UpdateMemberForm from '@/components/UpdateMemberForm'
import { useAdmin } from '@/contexts/AdminContext'

interface StudentMember {
  id: string
  name: string
  email: string
  branch: string
  year: string
  eventsAttended: number
  contributions: number
  achievements: Achievement[]
  points: number
  rank: number
}

interface Achievement {
  id: string
  title: string
  description: string
  date: string
  category: 'event' | 'contribution' | 'leadership' | 'excellence'
  icon: string
}

export default function MembersPage() {
  const { isAdmin } = useAdmin()
  const [members, setMembers] = useState<StudentMember[]>([])
  const [selectedMember, setSelectedMember] = useState<StudentMember | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<StudentMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [selectedYear])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/members?year=${selectedYear}`)
      const result = await response.json()
      
      if (result.success) {
        setMembers(result.data)
      } else {
        setError('Failed to load members')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.branch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const topPerformers = members.slice(0, 3)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event': return 'bg-blue-100 text-blue-700'
      case 'contribution': return 'bg-green-100 text-green-700'
      case 'leadership': return 'bg-purple-100 text-purple-700'
      case 'excellence': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-ieee-blue mx-auto mb-4" />
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">{error}</p>
          <button
            onClick={fetchMembers}
            className="px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ieee-blue">
              Student Members
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View achievements and contributions of all members
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-2 bg-ieee-blue text-white px-4 py-2 rounded-lg hover:bg-ieee-light transition whitespace-nowrap"
            >
              <UserPlus size={20} />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {topPerformers.map((member, index) => (
            <button
              key={`top-performer-${member.id}-${index}`}
              onClick={() => setSelectedMember(member)}
              className={`bg-gradient-to-br ${
                index === 0 ? 'from-yellow-400 to-yellow-500' :
                index === 1 ? 'from-gray-300 to-gray-400' :
                'from-orange-400 to-orange-500'
              } rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ieee-blue`}
              aria-label={`View ${member.name}'s profile - Rank ${member.rank}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy size={24} aria-hidden="true" />
                  <span className="text-2xl font-bold">#{member.rank}</span>
                </div>
                <Medal size={32} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-sm opacity-90 mb-3">{member.branch} • {member.year}</p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="text-2xl font-bold">{member.points} pts</p>
                <p className="text-xs opacity-90">{member.achievements.length} achievements</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Search members by name or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
        />
      </div>

      {/* Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition" >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setSelectedMember(member)}>
                <div className="w-12 h-12 bg-ieee-blue rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.branch} • {member.year}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMember(member)
                    }}
                    className="p-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition"
                    title="Update Member"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <div className="text-right">
                  <p className="text-2xl font-bold text-ieee-blue">#{member.rank}</p>
                  <p className="text-sm text-gray-500">{member.points} pts</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Events</p>
                <p className="text-xl font-bold text-blue-600">{member.eventsAttended}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Contributions</p>
                <p className="text-xl font-bold text-green-600">{member.contributions}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {member.achievements.slice(0, 2).map((achievement) => (
                <span
                  key={achievement.id}
                  className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}
                >
                  {achievement.icon} {achievement.title}
                </span>
              ))}
              {member.achievements.length > 2 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  +{member.achievements.length - 2} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-ieee-blue to-ieee-light text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                    <p className="opacity-90">{selectedMember.email}</p>
                    <p className="text-sm opacity-90">{selectedMember.branch} • {selectedMember.year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">#{selectedMember.rank}</p>
                  <p className="text-sm opacity-90">{selectedMember.points} points</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-ieee-blue" />
                Achievements ({selectedMember.achievements.length})
              </h3>

              <div className="space-y-4">
                {selectedMember.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-800">{achievement.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}>
                            {achievement.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <p className="text-xs text-gray-400">Earned on {achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="mt-6 w-full bg-ieee-blue text-white py-3 rounded-lg hover:bg-ieee-light transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Form */}
      <AddMemberForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={fetchMembers}
      />

      {/* Update Member Form */}
      <UpdateMemberForm
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={() => {
          fetchMembers()
          setEditingMember(null)
        }}
        member={editingMember}
      />
    </div>
  )
}
