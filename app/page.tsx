'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, Download, Search } from 'lucide-react'

interface Document {
  _id: string
  name: string
  type: string
  uploadDate: string
  size: string
  category: 'report' | 'document' | 'data'
  year: number
  driveFileId: string
  driveFileLink: string
  uploadedBy?: string
}

interface LoggedInMember {
  id: string
  name: string
  email: string
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [uploading, setUploading] = useState(false)
  const [loggedInMember, setLoggedInMember] = useState<LoggedInMember | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check for logged in member and admin on every render
  useEffect(() => {
    const checkAuth = () => {
      const memberData = localStorage.getItem('memberSession')
      if (memberData) {
        const parsed = JSON.parse(memberData)
        if (parsed.expiresAt > Date.now()) {
          setLoggedInMember(parsed.member)
        } else {
          setLoggedInMember(null)
        }
      } else {
        setLoggedInMember(null)
      }
      const adminAuth = localStorage.getItem('adminAuthenticated')
      setIsAdmin(adminAuth === 'true')
      setHydrated(true)
    }
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  useEffect(() => {
    fetchYears()
    fetchDocuments()
  }, [selectedYear, filterCategory])

  const fetchYears = async () => {
    try {
      const response = await fetch('/api/years')
      const result = await response.json()
      if (result.success) {
        setAvailableYears(result.data)
      }
    } catch (error) {
      console.error('Error fetching years:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams()
      params.append('year', selectedYear.toString())
      if (filterCategory !== 'all') {
        params.append('category', filterCategory)
      }

      const response = await fetch(`/api/documents?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', file.name)
    formData.append('category', filterCategory !== 'all' ? filterCategory : 'document')
    
    // Track who uploaded the document
    if (loggedInMember) {
      formData.append('uploadedBy', loggedInMember.id)
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchDocuments()
        await fetchYears()
        alert('File uploaded successfully!')
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const params = new URLSearchParams()
      if (loggedInMember) {
        params.append('memberId', loggedInMember.id)
      }
      if (isAdmin) {
        params.append('isAdmin', 'true')
      }
      
      const response = await fetch(`/api/documents/${id}?${params}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchDocuments()
        alert('Document deleted successfully')
      } else {
        alert('Delete failed: ' + result.error)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Delete failed')
    }
  }

  // Only admin can delete documents
  const canDeleteDocument = () => isAdmin

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* DEBUG: Show admin status */}
      <div className="fixed bottom-2 right-2 bg-gray-100 border border-gray-300 rounded px-3 py-1 text-xs text-gray-700 z-50 shadow">
        <span>Admin Mode: <b>{isAdmin ? 'ON' : 'OFF'}</b></span>
      </div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-ieee-blue mb-2">
          IEEE SIGHT AITR Dashboard
        </h1>
        <p className="text-gray-600">
          Manage documents, reports, and track progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Documents</p>
              <p className="text-3xl font-bold text-ieee-blue mt-1">
                {documents.length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-ieee-blue opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Reports</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {documents.filter(d => d.category === 'report').length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {documents.filter(d => {
                  const docMonth = new Date(d.uploadDate).getMonth()
                  const currentMonth = new Date().getMonth()
                  return docMonth === currentMonth
                }).length}
              </p>
            </div>
            <Upload className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Document Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Documents & Reports</h2>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-ieee-blue text-white px-4 py-2 rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400"
            >
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            )}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
          >
            <option value="all">All Categories</option>
            <option value="report">Reports</option>
            <option value="document">Documents</option>
            <option value="data">Data</option>
          </select>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No documents found</p>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <FileText className="text-ieee-blue" size={24} strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.type} • {doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded text-xs font-semibold border border-ieee-blue text-ieee-blue bg-white">
                    {doc.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.driveFileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-ieee-blue hover:text-black transition"
                    title="Download"
                  >
                    <Download size={20} strokeWidth={1.5} />
                  </a>
                  {hydrated && canDeleteDocument() && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 text-ieee-blue hover:text-red-600 transition"
                      title="Delete document"
                    >
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
