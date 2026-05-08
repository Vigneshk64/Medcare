'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../app/context/AuthContext'

export default function RoleRedirect() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        // User is authenticated and has a role, redirect to appropriate dashboard
        router.push(`/dashboard/${role}`)
      }
      // If no user or no role, stay on current page (will be handled by login page)
    }
  }, [user, role, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If not authenticated or no role, don't render anything (let the parent handle it)
  return null
}
