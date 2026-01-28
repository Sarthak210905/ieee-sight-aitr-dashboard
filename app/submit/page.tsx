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

  // UI continues unchanged...
  return (
    <div>
      {/* Your JSX remains the same */}
    </div>
  )
}
