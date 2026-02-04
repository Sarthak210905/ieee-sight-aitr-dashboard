'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { User, Award, Trophy, Calendar, BookOpen, Mail, Star, TrendingUp, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-react'
import { useMember } from '@/contexts/MemberContext'
import Link from 'next/link'

interface Achievement {
  id: string
  title: string
  description: string
  date: string
  category: string
  icon: string
}

interface MemberProfile {
  _id: string
  name: string
  email: string
  branch: string
  year: string
  bio?: string
  profileImage?: string
  points: number
  eventsAttended: number
  contributions: number
  achievements: Achievement[]
  joinYear: number
  rank: number
}

export default function ProfilePage() {
  const params = useParams()
  const memberId = params.id as string
  const { member: loggedInMember, refreshMember } = useMember()
  
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const isOwnProfile = loggedInMember?._id === memberId

  useEffect(() => {
    fetchProfile()
  }, [memberId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`)
      const result = await response.json()
      
      if (result.success) {
        setProfile(result.data)
        setBio(result.data.bio || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBio = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      })

      const result = await response.json()
      if (result.success) {
        setProfile({ ...profile!, bio })
        setEditing(false)
        refreshMember()
      }
    } catch (error) {
      console.error('Error saving bio:', error)
    } finally {
      setSaving(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event': return 'bg-blue-100 text-blue-700'
      case 'contribution': return 'bg-green-100 text-green-700'
      case 'leadership': return 'bg-purple-100 text-purple-700'
      case 'excellence': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ieee-blue"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <User className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Member Not Found</h2>
        <p className="text-gray-600">This profile doesn't exist or has been removed.</p>
        <Link href="/members" className="mt-4 inline-block text-ieee-blue hover:underline">
          ← Back to Members
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-ieee-blue to-ieee-light rounded-lg shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-5xl font-bold">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm opacity-90 mb-4">
              <span className="flex items-center gap-1">
                <Mail size={16} />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                {profile.branch}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {profile.year}
              </span>
            </div>

            {/* Bio */}
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio..."
                  className="flex-1 px-4 py-2 rounded-lg text-gray-800 focus:outline-none"
                />
                <button
                  onClick={handleSaveBio}
                  disabled={saving}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setBio(profile.bio || '')
                  }}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="opacity-90">{profile.bio || 'No bio yet'}</p>
                {isOwnProfile && (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1 hover:bg-white/20 rounded transition"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Points Badge */}
          <div className="bg-white/20 rounded-xl p-6 text-center">
            <Trophy className="mx-auto mb-2" size={32} />
            <p className="text-4xl font-bold">{profile.points}</p>
            <p className="text-sm opacity-75">Total Points</p>
            {profile.rank > 0 && (
              <p className="mt-2 text-sm bg-white/20 rounded-full px-3 py-1">
                Rank #{profile.rank}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Award className="mx-auto text-blue-500 mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-800">{profile.achievements.length}</p>
          <p className="text-sm text-gray-600">Achievements</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Calendar className="mx-auto text-green-500 mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-800">{profile.eventsAttended}</p>
          <p className="text-sm text-gray-600">Events Attended</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <TrendingUp className="mx-auto text-purple-500 mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-800">{profile.contributions}</p>
          <p className="text-sm text-gray-600">Contributions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Star className="mx-auto text-yellow-500 mb-2" size={28} />
          <p className="text-2xl font-bold text-gray-800">{profile.joinYear}</p>
          <p className="text-sm text-gray-600">Member Since</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Award className="text-ieee-blue" />
          Achievements
        </h2>

        {profile.achievements.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No achievements yet</p>
            {isOwnProfile && (
              <Link 
                href="/submit"
                className="mt-4 inline-block text-ieee-blue hover:underline"
              >
                Submit your first achievement →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {profile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(achievement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
