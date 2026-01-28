'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddProgressFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function AddProgressForm({ isOpen, onClose, onSuccess }: AddProgressFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear(),
    events: 0,
    members: 0,
    documents: 0,
    target: 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert('Progress data added successfully!')
        setFormData({
          month: '',
          year: new Date().getFullYear(),
          events: 0,
          members: 0,
          documents: 0,
          target: 5
        })
        onSuccess()
        onClose()
      } else {
        alert('Failed to add progress: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding progress:', error)
      alert('Failed to add progress')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add Progress Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              >
                <option value="">Select Month</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Events Conducted *
            </label>
            <input
              type="number"
              required
              value={formData.events}
              onChange={(e) => setFormData({ ...formData, events: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active Members *
            </label>
            <input
              type="number"
              required
              value={formData.members}
              onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documents Uploaded *
            </label>
            <input
              type="number"
              required
              value={formData.documents}
              onChange={(e) => setFormData({ ...formData, documents: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Events *
            </label>
            <input
              type="number"
              required
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
