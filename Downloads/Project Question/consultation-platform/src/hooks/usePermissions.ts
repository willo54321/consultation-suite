'use client'

import { useMockAuth } from '@/contexts/MockAuthContext'

// Hook for easy permission checking in components
export function usePermissions() {
  const { permissions, role } = useMockAuth()

  return {
    ...permissions,
    role,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    canEdit: role !== 'viewer',
  }
}
