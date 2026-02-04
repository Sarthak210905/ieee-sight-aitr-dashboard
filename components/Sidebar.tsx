'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Users, Trophy, FileText, Shield, LogOut, Award, ClipboardCheck, User, Calendar, Flag, Menu, X } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'
import { useMember } from '@/contexts/MemberContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Submit Achievement', href: '/submit', icon: Award },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
]

const adminNavigation = [
  { name: 'Approvals', href: '/admin/approvals', icon: ClipboardCheck },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Certificates', href: '/certificates', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isAdmin, setShowLoginModal: setShowAdminLogin, logout: adminLogout } = useAdmin()
  const { member, isLoggedIn, setShowLoginModal: setShowMemberLogin, logout: memberLogout } = useMember()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-ieee-blue rounded-lg flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">IEEE SIGHT</h1>
            <p className="text-xs text-gray-500">AITR Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50 transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 lg:block hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ieee-blue rounded-lg flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">IEEE SIGHT</h1>
            <p className="text-xs text-gray-500">AITR Dashboard</p>
          </div>
        </div>
      </div>

      {/* Mobile Logo Spacer */}
      <div className="lg:hidden h-4"></div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-ieee-blue text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}

        {/* Admin-only navigation */}
        {isAdmin && (
          <>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p className="px-4 text-xs text-gray-500 font-semibold uppercase mb-2">Admin</p>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-ieee-blue text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </nav>

      {/* Admin Section */}
      <div className="absolute bottom-32 left-0 right-0 p-4 border-t border-gray-200">
        {isAdmin ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <Shield className="text-green-600" size={16} />
              <span className="text-sm font-medium text-green-700">Admin Mode</span>
            </div>
            <button
              onClick={adminLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Admin Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdminLogin(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Shield className="text-gray-600" size={20} />
            <span className="font-medium text-gray-600">Admin Login</span>
          </button>
        )}
      </div>

      {/* Member Section */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        {isLoggedIn && member ? (
          <div className="flex items-center gap-2 justify-between">
            <Link 
              href={`/profile/${member._id}`}
              onClick={closeMobileMenu}
              className="flex items-center gap-2 px-3 py-2 bg-ieee-blue/10 rounded-lg hover:bg-ieee-blue/20 transition flex-1"
            >
              <div className="w-8 h-8 bg-ieee-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                <p className="text-xs text-gray-500">{member.points} pts</p>
              </div>
            </Link>
            <button
              onClick={memberLogout}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setShowMemberLogin(true); closeMobileMenu(); }}
            className="w-full flex items-center gap-2 px-4 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-light transition"
          >
            <User size={18} />
            <span className="font-medium">Member Login</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-semibold mb-1">IEEE SIGHT AITR</p>
          <p>© 2026 All rights reserved</p>
        </div>
      </div>
    </aside>
    </>
  )
}
