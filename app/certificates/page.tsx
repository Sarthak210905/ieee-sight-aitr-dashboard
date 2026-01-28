'use client'

import { useState, useEffect } from 'react'
import { Award, FileText, Users, Search, Plus } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import CertificateGenerator from '@/components/CertificateGenerator'

interface Member {
  _id: string
  name: string
  email: string
  achievements: Array<{
    id: string
    title: string
    category: string
    date: string
  }>
}

export default function CertificatesPage() {
  const { isAdmin } = useAdmin()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      const result = await response.json()
      if (result.success) {
        setMembers(result.data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCertificateGenerator = (member: Member, achievement?: any) => {
    setSelectedData({
      recipientName: member.name,
      achievementTitle: achievement?.title || '',
      date: achievement?.date ? new Date(achievement.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: achievement?.category || 'excellence',
      points: 0,
      certificateId: `IEEE-SIGHT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    })
    setShowGenerator(true)
  }

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const membersWithAchievements = filteredMembers.filter(m => m.achievements && m.achievements.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
              <FileText className="text-ieee-blue" />
              Certificates
            </h1>
            <p className="text-gray-600">Generate certificates for member achievements</p>
          </div>
          <button
            onClick={() => {
              setSelectedData(null)
              setShowGenerator(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition"
          >
            <Plus size={18} />
            Create Certificate
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
          />
        </div>
      </div>

      {/* Members with Achievements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Members with Achievements
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ieee-blue mx-auto"></div>
          </div>
        ) : membersWithAchievements.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No members with achievements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {membersWithAchievements.map((member) => (
              <div
                key={member._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className="text-sm bg-ieee-blue/10 text-ieee-blue px-3 py-1 rounded-full">
                    {member.achievements.length} achievement{member.achievements.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid gap-2">
                  {member.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-700">{achievement.title}</p>
                        <p className="text-xs text-gray-500">
                          {achievement.category} • {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => openCertificateGenerator(member, achievement)}
                        className="flex items-center gap-1 px-3 py-1 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition text-sm"
                      >
                        <FileText size={14} />
                        Generate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Members Quick Generate */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-ieee-blue" />
          Quick Generate for Any Member
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.slice(0, 12).map((member) => (
            <button
              key={member._id}
              onClick={() => openCertificateGenerator(member)}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-ieee-blue hover:bg-ieee-blue/5 transition text-left"
            >
              <div className="w-10 h-10 bg-ieee-blue rounded-full flex items-center justify-center text-white font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-800">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Generator Modal */}
      {showGenerator && (
        <CertificateGenerator
          data={selectedData}
          onClose={() => {
            setShowGenerator(false)
            setSelectedData(null)
          }}
        />
      )}
    </div>
  )
}
