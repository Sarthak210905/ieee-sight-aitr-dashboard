'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminContextType {
  isAdmin: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Check if admin session exists
    const adminSession = localStorage.getItem('ieee-admin-session')
    if (adminSession) {
      const { expiry } = JSON.parse(adminSession)
      if (new Date().getTime() < expiry) {
        setIsAdmin(true)
      } else {
        localStorage.removeItem('ieee-admin-session')
      }
    }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Set session for 24 hours
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000
        localStorage.setItem('ieee-admin-session', JSON.stringify({ 
          token: result.token,
          expiry 
        }))
        setIsAdmin(true)
        setShowLoginModal(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('ieee-admin-session')
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      login, 
      logout, 
      showLoginModal, 
      setShowLoginModal 
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
