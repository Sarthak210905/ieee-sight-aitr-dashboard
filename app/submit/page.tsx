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
  { value: 'event', label: 'Event Participation', icon: '🎪', points: 10 },
  { value: 'contribution', label: 'Contribution', icon: '✍️', points: 15 },
  { value: 'leadership', label: 'Leadership', icon: '🎯', points: 20 },
  { value: 'excellence', label: 'Excellence Award', icon: '⭐', points: 25 },
]

export default function SubmitAchievementPage() {
  const { member, isLoggedIn, setShowLoginModal } = useMember()
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
      if (result.success) {
        setMySubmissions(result.data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    }
  }

  const fetchMyReports = async () => {
    if (!member?._id) return
    try {
      const response = await fetch(`/api/reports?memberId=${member._id}`)
      const result = await response.json()
      if (result.success) {
        setMyReports(result.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleCategoryChange = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    setFormData({
      ...formData,
      category,
      points: cat?.points || 10
    })
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
        body: JSON.stringify({
          memberId: member._id,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Achievement submitted successfully! It will be reviewed by admin.')
        setFormData({
          title: '',
          description: '',
          category: 'event',
          proof: '',
          points: 10
        })
        fetchMySubmissions()
      } else {
        alert('Failed to submit: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Failed to submit achievement')
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

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return
    
    try {
      const response = await fetch(`/api/achievements/${submissionId}?memberId=${member?._id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Submission deleted successfully')
        fetchMySubmissions()
      } else {
        alert('Failed to delete: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete submission')
    }
  }

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!member) return
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: member._id,
          reporterName: member.name,
          reporterEmail: member.email,
          type: reportData.type,
          subject: reportData.subject,
          description: reportData.description,
          relatedTo: reportData.relatedTo,
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Report submitted successfully! Admin will review it.')
        setShowReportModal(false)
        setReportData({ subject: '', description: '', type: 'issue', relatedTo: '' })
        fetchMyReports()
      } else {
        alert('Failed to submit report: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      const response = await fetch(`/api/reports/${reportId}?memberId=${member?._id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Report deleted successfully')
        fetchMyReports()
      } else {
        alert('Failed to delete: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    }
  }

  const openReportModal = (relatedTo?: string) => {
    setReportData({ ...reportData, relatedTo: relatedTo || '' })
    setShowReportModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Submit Achievement
        </h1>
        <p className="text-gray-600">
          Submit your achievements for review. Once approved, you'll earn points!
        </p>
      </div>

      {/* Login Required */}
      {!isLoggedIn ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Lock className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to submit your achievements. Only you can submit achievements for yourself.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition font-semibold"
          >
            <User size={20} />
            Login / Register
          </button>
        </div>
      ) : (
        <>
          {/* Logged in user info */}
          <div className="bg-gradient-to-r from-ieee-blue to-ieee-light rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {member?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome, {member?.name}!</h2>
                <p className="opacity-90">{member?.email}</p>
                <p className="text-sm opacity-75 mt-1">
                  Current Points: <span className="font-bold">{member?.points || 0}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Send className="text-ieee-blue" />
              New Achievement
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="e.g., Organized Tech Workshop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`p-3 rounded-lg border-2 text-center transition ${
                        formData.category === cat.value
                          ? 'border-ieee-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                      <span className="text-xs text-gray-500 block">+{cat.points} pts</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  rows={4}
                  placeholder="Describe your achievement in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof/Evidence (Optional)
                </label>
                <input
                  type="text"
                  value={formData.proof}
                  onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Link to certificate, photo, or other proof"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <Trophy className="inline mr-2" size={16} />
                  Points to be awarded if approved: <strong>{formData.points} points</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400 font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </form>
          </div>

          {/* My Submissions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" />
              My Submissions
            </h2>

            {mySubmissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't submitted any achievements yet.
              </p>
            ) : (
              <div className="space-y-4">
                {mySubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(submission.status)}
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
                        {submission.adminComment && (
                          <div className="mt-2 bg-gray-50 rounded p-2">
                            <p className="text-xs text-gray-600">
                              <strong>Admin Comment:</strong> {submission.adminComment}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {submission.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(submission._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete submission"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => openReportModal(submission._id)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                          title="Report an issue"
                        >
                          <Flag size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Flag className="text-orange-500" />
              My Reports
            </h2>

            {myReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                You haven't submitted any reports yet.
              </p>
            ) : (
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div
                    key={report._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {report.type === 'bug' ? '🐛' : 
                             report.type === 'issue' ? '⚠️' : 
                             report.type === 'suggestion' ? '💡' : 
                             report.type === 'complaint' ? '📢' : '📝'}
                          </span>
                          <h3 className="font-bold text-gray-800">{report.subject}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.status === 'open' ? 'bg-blue-100 text-blue-700' :
                            report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Type: {report.type}</span>
                          <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.adminResponse && (
                          <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-700">
                              <strong>Admin Response:</strong> {report.adminResponse}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Delete Button - Only admin can delete */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition ml-4"
                          title="Delete report"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Flag className="text-red-500" />
                Report an Issue
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportData.type}
                  onChange={(e) => setReportData({ ...reportData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                >
                  <option value="bug">Bug / Error</option>
                  <option value="issue">Issue with Submission</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={reportData.subject}
                  onChange={(e) => setReportData({ ...reportData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Brief subject of your report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="flex gap-3 pt-2">
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