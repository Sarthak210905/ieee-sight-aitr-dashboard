'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/navigation'
import { Flag, MessageSquare, Clock, CheckCircle, AlertCircle, RefreshCw, Send, Loader2 } from 'lucide-react'

interface Report {
  _id: string
  reporterId: string
  reporterName: string
  reporterEmail: string
  type: string
  subject: string
  description: string
  relatedTo?: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: string
  adminResponse?: string
  createdAt: string
}

export default function AdminReportsPage() {
  const { isAdmin } = useAdmin()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('open')
  const [responding, setResponding] = useState<string | null>(null)
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/')
      return
    }
    fetchReports()
  }, [isAdmin, router, filter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/reports?admin=true' 
        : `/api/reports?admin=true&status=${filter}`
      const res = await fetch(url)
      const result = await res.json()
      if (result.success) {
        setReports(result.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReport = async (id: string, status: string, adminResponse?: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse }),
      })
      
      const result = await res.json()
      if (result.success) {
        fetchReports()
        setResponding(null)
        setResponse('')
      }
    } catch (error) {
      console.error('Error updating report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛'
      case 'issue': return '⚠️'
      case 'complaint': return '😤'
      case 'suggestion': return '💡'
      default: return '📝'
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ieee-blue mb-2 flex items-center gap-2">
              <Flag className="text-red-500" />
              Member Reports
            </h1>
            <p className="text-gray-600">Review and respond to member reports</p>
          </div>
          <button
            onClick={fetchReports}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['open', 'in-progress', 'resolved', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-ieee-blue text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ieee-blue mx-auto"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto text-green-300 mb-4" size={64} />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getTypeIcon(report.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800">{report.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{report.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span>By: {report.reporterName}</span>
                      <span>Email: {report.reporterEmail}</span>
                      <span>Type: {report.type}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {report.adminResponse && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-green-700">
                          <MessageSquare className="inline mr-1" size={14} />
                          <strong>Admin Response:</strong> {report.adminResponse}
                        </p>
                      </div>
                    )}

                    {responding === report._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Write your response..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReport(report._id, 'resolved', response)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => updateReport(report._id, 'in-progress', response)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            Mark In Progress
                          </button>
                          <button
                            onClick={() => {
                              setResponding(null)
                              setResponse('')
                            }}
                            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {report.status !== 'resolved' && report.status !== 'closed' && (
                          <button
                            onClick={() => setResponding(report._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-ieee-blue text-white rounded text-sm hover:bg-ieee-light"
                          >
                            <Send size={14} />
                            Respond
                          </button>
                        )}
                        {report.status !== 'closed' && (
                          <button
                            onClick={() => updateReport(report._id, 'closed')}
                            className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    )}
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
