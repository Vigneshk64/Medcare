'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../app/context/AuthContext'

interface AuthRedirectProps {
  requiredRole: 'admin' | 'doctor' | 'pharmacist' | 'patient'
  children: React.ReactNode
}

export default function AuthRedirect({ requiredRole, children }: AuthRedirectProps) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push('/login')
      } else if (!role) {
        // User exists but no role, redirect to login for role selection
        router.push('/login')
      } else if (role !== requiredRole) {
        // User has wrong role, redirect to correct dashboard
        router.push(`/dashboard/${role}`)
      }
    }
  }, [user, role, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user || !role || role !== requiredRole) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
