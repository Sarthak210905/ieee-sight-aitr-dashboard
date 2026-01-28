'use client'

import { ReactNode } from 'react'
import { AdminProvider } from '@/contexts/AdminContext'
import { MemberProvider } from '@/contexts/MemberContext'
import AdminLoginModal from '@/components/AdminLoginModal'
import MemberLoginModal from '@/components/MemberLoginModal'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <MemberProvider>
        {children}
        <AdminLoginModal />
        <MemberLoginModal />
      </MemberProvider>
    </AdminProvider>
  )
}
