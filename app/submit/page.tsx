'use client'

import { useState, useEffect } from 'react'
import { Award, Send, CheckCircle, Clock, XCircle, Trophy, Star, Lock, User, Trash2, Flag, X } from 'lucide-react'
import { useMember } from '@/contexts/MemberContext'

interface Submission {
  _id: string
  title: string
  description: string
  category: string
  points: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  adminComment?: string
}

interface MyReport {
  _id: string
  type: string
  subject: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  adminResponse?: string
  createdAt: string
}

const CATEGORIES = [
  { value: 'event', label: 'Event Participation', points: 10 },
  { value: 'contribution', label: 'Certification', points: 15 },
  { value: 'leadership', label: 'Ambassador/Volunteering', points: 20 },
  { value: 'excellence', label: 'Grant Received', points: 25 },
]

export default function SubmitAchievementPage() {
  const { member, isLoggedIn, setShowLoginModal } = useMember()

  // ✅ FIX: define admin flag
  const isAdmin = member?.role === 'admin'

  const [mySubmissions, setMySubmissions] = useState<Submission[]>([])
  const [myReports, setMyReports] = useState<MyReport[]>([])
  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState({ subject: '', description: '', type: 'issue', relatedTo: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'event',
    proof: '',
    points: 10
  })

  useEffect(() => {
    if (isLoggedIn && member?._id) {
      fetchMySubmissions()
      fetchMyReports()
    }
  }, [isLoggedIn, member])

  const fetchMySubmissions = async () => {
    if (!member?._id) return
    try {
      const response = await fetch(`/api/achievements?memberId=${member._id}`)
      const result = await response.json()
      if (result.success) setMySubmissions(result.data)
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }
  }

  const fetchMyReports = async () => {
    if (!member?._id) return
    try {
      const response = await fetch(`/api/reports?memberId=${member._id}`)
      const result = await response.json()
      if (result.success) setMyReports(result.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    setFormData({ ...formData, category, points: cat?.points || 10 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn || !member?._id) {
      alert('Please login first')
      setShowLoginModal(true)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member._id, ...formData })
      })

      const result = await response.json()

      if (result.success) {
        alert('Achievement submitted successfully!')
        setFormData({ title: '', description: '', category: 'event', proof: '', points: 10 })
        fetchMySubmissions()
      } else {
        alert('Failed: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-500" size={20} />
      case 'rejected': return <XCircle className="text-red-500" size={20} />
      default: return <Clock className="text-yellow-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Delete this report?')) return
    await fetch(`/api/reports/${reportId}?memberId=${member?._id}`, { method: 'DELETE' })
    fetchMyReports()
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member?._id || !member?.name || !member?.email) return
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: member._id,
          reporterName: member.name,
          reporterEmail: member.email,
          ...reportData
        })
      })
      
      const result = await response.json()
      if (result.success) {
        alert('Report submitted successfully!')
        setShowReportModal(false)
        setReportData({ subject: '', description: '', type: 'issue', relatedTo: '' })
        fetchMyReports()
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Lock className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to submit achievements</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-ieee-blue text-white px-6 py-3 rounded-lg hover:bg-ieee-light transition"
          >
            Login as Member
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
              <Award className="text-ieee-blue w-6 h-6 sm:w-8 sm:h-8" />
              Submit Achievement
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Submit your achievements and track their approval status
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm sm:text-base whitespace-nowrap"
          >
            <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Member Info */}
      <div className="bg-gradient-to-r from-ieee-blue to-ieee-light text-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {member?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{member?.name}</h2>
            <p className="opacity-90">{member?.email}</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit New Achievement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`p-4 border-2 rounded-lg transition ${
                    formData.category === cat.value
                      ? 'border-ieee-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* <div className="text-3xl mb-2">{cat.icon}</div> */}
                  <div className="text-sm font-medium text-gray-800">{cat.label}</div>
                  <div className="text-xs text-gray-500">{cat.points} points</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="e.g., Completed Advanced AI Workshop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="Describe your achievement in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof/Evidence (Link)
            </label>
            <input
              type="url"
              value={formData.proof}
              onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              placeholder="https://... (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ieee-blue text-white py-3 rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {loading ? 'Submitting...' : 'Submit Achievement'}
          </button>
        </form>
      </div>

      {/* My Submissions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Submissions</h2>
        
        {mySubmissions.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No submissions yet. Submit your first achievement above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mySubmissions.map((submission) => (
              <div
                key={submission._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800">{submission.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{submission.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {submission.category}</span>
                      <span>Points: {submission.points}</span>
                      <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                  </div>
                </div>

                {submission.adminComment && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    submission.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Comment:</p>
                    <p className="text-sm text-gray-600">{submission.adminComment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Reports */}
      {myReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Reports</h2>
          
          <div className="space-y-4">
            {myReports.map((report) => (
              <div key={report._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800">{report.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'open' ? 'bg-red-100 text-red-700' :
                        report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <p className="text-xs text-gray-500">
                      Type: {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    
                    {report.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                        <p className="text-sm text-gray-600">{report.adminResponse}</p>
                      </div>
                    )}
                  </div>
                  
                  {report.status === 'open' && (
                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Report an Issue</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={reportData.type}
                  onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                >
                  <option value="issue">Issue</option>
                  <option value="bug">Bug</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={reportData.subject}
                  onChange={(e) => setReportData({ ...reportData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Provide details about the issue..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
