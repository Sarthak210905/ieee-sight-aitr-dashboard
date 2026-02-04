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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('year', selectedYear.toString())
      if (filterCategory !== 'all') {
        params.append('category', filterCategory)
      }

      const response = await fetch(`/api/documents?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setDocuments(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setDocuments([])
    } finally {
      setLoading(false)
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
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ieee-blue mb-2">
          IEEE SIGHT AITR Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage documents, reports, and track progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Total Documents</p>
              <p className="text-2xl sm:text-3xl font-bold text-ieee-blue mt-1">
                {documents.length}
              </p>
            </div>
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-ieee-blue opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">Reports</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">
                {documents.filter(d => d.category === 'report').length}
              </p>
            </div>
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm">This Month</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">
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
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Documents & Reports</h2>
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-ieee-blue text-white px-4 py-3 rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400 text-sm sm:text-base font-medium"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-sm sm:text-base"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-sm sm:text-base min-w-[100px]"
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
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue text-sm sm:text-base min-w-[120px] sm:min-w-[150px]"
          >
            <option value="all">All Categories</option>
            <option value="report">Reports</option>
            <option value="document">Documents</option>
            <option value="data">Data</option>
          </select>
        </div>

        {/* Documents List */}
        <div className="space-y-2 sm:space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">No documents found</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-ieee-blue transition gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <FileText className="text-ieee-blue flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 mt-1 sm:mt-0" strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{doc.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      <span className="inline-block">{doc.type}</span>
                      <span className="mx-1">•</span>
                      <span className="inline-block">{doc.size}</span>
                      <br className="sm:hidden" />
                      <span className="sm:mx-1 sm:inline hidden">•</span>
                      <span className="inline-block">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                    </p>
                    <span className="inline-block mt-2 px-2 sm:px-3 py-1 rounded text-xs font-semibold border border-ieee-blue text-ieee-blue bg-blue-50">
                      {doc.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 justify-end sm:justify-start">
                  <a
                    href={doc.driveFileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-ieee-blue hover:bg-ieee-blue hover:text-white border-2 border-ieee-blue rounded-lg transition font-medium text-sm"
                    title="Download"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  {hydrated && canDeleteDocument() && (
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white border-2 border-red-600 rounded-lg transition font-medium text-sm"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                      <span className="hidden sm:inline">Delete</span>
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
