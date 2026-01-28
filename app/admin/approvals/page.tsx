'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/navigation'
import { Shield, CheckCircle, XCircle, Clock, User, Award, Calendar, MessageSquare, RefreshCw } from 'lucide-react'

interface Submission {
  _id: string
  memberId: string
  memberName: string
  memberEmail: string
  title: string
  description: string
  category: string
  proof?: string
  points: number
  status: 'pending' | 'approved' | 'rejected'
  adminComment?: string
  submittedAt: string
}

export default function AdminApprovalsPage() {
  const { isAdmin } = useAdmin()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [comment, setComment] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchSubmissions()
  }, [isAdmin, router])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/achievements' 
        : `/api/achievements?status=${filter}`
      const response = await fetch(url)
      const result = await response.json()
      if (result.success) {
        setSubmissions(result.data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions()
    }
  }, [filter])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          adminComment: comment[id] || 'Achievement approved!'
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Achievement approved! Points added to member.')
        fetchSubmissions()
      } else {
        alert('Failed to approve: ' + result.error)
      }
    } catch (error) {
      console.error('Error approving:', error)
      alert('Failed to approve achievement')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!comment[id]) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setProcessingId(id)
    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          adminComment: comment[id]
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('Achievement rejected.')
        fetchSubmissions()
      } else {
        alert('Failed to reject: ' + result.error)
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Failed to reject achievement')
    } finally {
      setProcessingId(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600">Admin access required to view this page.</p>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event': return '🎪'
      case 'contribution': return '✍️'
      case 'leadership': return '🎯'
      case 'excellence': return '⭐'
      default: return '📌'
    }
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
              <Shield className="text-ieee-blue" />
              Achievement Approvals
            </h1>
            <p className="text-gray-600">
              Review and approve member achievement submissions
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilter('pending')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${filter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500" size={24} />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => setFilter('approved')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${filter === 'approved' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'approved').length}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => setFilter('rejected')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${filter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <XCircle className="text-red-500" size={24} />
            <div>
              <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'rejected').length}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => setFilter('all')}
          className={`bg-white rounded-lg shadow p-4 cursor-pointer transition ${filter === 'all' ? 'ring-2 ring-ieee-blue' : ''}`}
        >
          <div className="flex items-center gap-3">
            <Award className="text-ieee-blue" size={24} />
            <div>
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-sm text-gray-600">All Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Submissions
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ieee-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Award className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} submissions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className={`border rounded-lg p-4 ${
                  submission.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
                  submission.status === 'approved' ? 'border-green-300 bg-green-50' :
                  'border-red-300 bg-red-50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(submission.category)}</span>
                      <h3 className="font-bold text-lg text-gray-800">{submission.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'pending' ? 'bg-yellow-200 text-yellow-700' :
                        submission.status === 'approved' ? 'bg-green-200 text-green-700' :
                        'bg-red-200 text-red-700'
                      }`}>
                        {submission.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{submission.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {submission.memberName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={14} />
                        {submission.points} points
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {submission.proof && (
                      <div className="mt-2">
                        <a
                          href={submission.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-ieee-blue hover:underline"
                        >
                          📎 View Proof
                        </a>
                      </div>
                    )}

                    {submission.adminComment && submission.status !== 'pending' && (
                      <div className="mt-2 bg-white rounded p-2">
                        <p className="text-sm text-gray-600">
                          <MessageSquare className="inline mr-1" size={14} />
                          <strong>Admin:</strong> {submission.adminComment}
                        </p>
                      </div>
                    )}
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex flex-col gap-2 lg:w-64">
                      <textarea
                        placeholder="Comment (required for rejection)"
                        value={comment[submission._id] || ''}
                        onChange={(e) => setComment({ ...comment, [submission._id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(submission._id)}
                          disabled={processingId === submission._id}
                          className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400 flex items-center justify-center gap-1 text-sm"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission._id)}
                          disabled={processingId === submission._id}
                          className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400 flex items-center justify-center gap-1 text-sm"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
