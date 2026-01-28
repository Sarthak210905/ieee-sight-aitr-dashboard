'use client'

import { useState } from 'react'
import { X, Lock, Shield } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'

export default function AdminLoginModal() {
  const { showLoginModal, setShowLoginModal, login, isAdmin, logout } = useAdmin()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(password)
    
    if (!success) {
      setError('Invalid admin password')
    }
    
    setPassword('')
    setLoading(false)
  }

  if (!showLoginModal) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" 
      onClick={() => setShowLoginModal(false)}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="text-ieee-blue" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          </div>
          <button 
            onClick={() => setShowLoginModal(false)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {isAdmin ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={32} />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">You are logged in as Admin</p>
            <p className="text-sm text-gray-600 mb-4">You have full access to manage members, progress, and winners.</p>
            <button
              onClick={() => {
                logout()
                setShowLoginModal(false)
              }}
              className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ieee-blue"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ieee-blue text-white py-3 rounded-lg hover:bg-ieee-light transition disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Login as Admin'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Contact the IEEE SIGHT AITR coordinator if you need admin access.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
