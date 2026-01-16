'use client'

import { useState, useRef, useEffect } from 'react'
import { useMockAuth } from '@/contexts/MockAuthContext'
import { UserRole } from '@/lib/mock-auth'
import { User, Shield, Eye, ChevronDown } from 'lucide-react'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'bg-brand-600', icon: Shield },
  user: { label: 'User', color: 'bg-blue-600', icon: User },
  viewer: { label: 'Viewer', color: 'bg-slate-500', icon: Eye },
}

export default function UserMenu() {
  const { user, role, setRole } = useMockAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentConfig = ROLE_CONFIG[role]
  const Icon = currentConfig.icon

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`w-6 h-6 rounded-full ${currentConfig.color} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-slate-700">{currentConfig.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Test Mode - Switch Role
            </p>
          </div>

          {/* Role options */}
          <div className="py-1">
            {(Object.keys(ROLE_CONFIG) as UserRole[]).map((roleOption) => {
              const config = ROLE_CONFIG[roleOption]
              const RoleIcon = config.icon
              const isSelected = role === roleOption

              return (
                <button
                  key={roleOption}
                  onClick={() => {
                    setRole(roleOption)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-2 text-sm w-full transition-colors ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                    <RoleIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium">{config.label}</span>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-slate-500">Current</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Info */}
          <div className="px-4 py-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Viewing as: <span className="font-medium">{user.name}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
