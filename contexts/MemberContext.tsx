'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MemberSession {
  _id: string
  name: string
  email: string
  branch: string
  year: string
  points: number
  profileImage?: string
}

interface MemberContextType {
  member: MemberSession | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  refreshMember: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  branch: string
  year: string
}

const MemberContext = createContext<MemberContextType | undefined>(undefined)

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberSession | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('memberSession')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession)
        // Verify session is still valid
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          setMember(session.member)
        } else {
          localStorage.removeItem('memberSession')
        }
      } catch {
        localStorage.removeItem('memberSession')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'login' }),
      })

      const result = await response.json()

      if (result.success) {
        const session = {
          member: result.data,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        }
        localStorage.setItem('memberSession', JSON.stringify(session))
        setMember(result.data)
        setShowLoginModal(false)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'register' }),
      })

      const result = await response.json()

      if (result.success) {
        const session = {
          member: result.data,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem('memberSession', JSON.stringify(session))
        setMember(result.data)
        setShowLoginModal(false)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('memberSession')
    setMember(null)
  }

  const refreshMember = async () => {
    if (!member?._id) return
    
    try {
      const response = await fetch(`/api/members/${member._id}`)
      const result = await response.json()
      
      if (result.success) {
        const session = {
          member: {
            _id: result.data._id,
            name: result.data.name,
            email: result.data.email,
            branch: result.data.branch,
            year: result.data.year,
            points: result.data.points,
            profileImage: result.data.profileImage,
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
        localStorage.setItem('memberSession', JSON.stringify(session))
        setMember(session.member)
      }
    } catch (error) {
      console.error('Error refreshing member:', error)
    }
  }

  return (
    <MemberContext.Provider
      value={{
        member,
        isLoggedIn: !!member,
        login,
        register,
        logout,
        showLoginModal,
        setShowLoginModal,
        refreshMember,
      }}
    >
      {children}
    </MemberContext.Provider>
  )
}

export function useMember() {
  const context = useContext(MemberContext)
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider')
  }
  return context
}
