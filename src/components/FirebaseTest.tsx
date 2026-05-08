'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function FirebaseTest() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔍 Auth state changed:', currentUser)
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const testFirestoreAccess = async () => {
    try {
      console.log('🔍 Testing Firestore access...')
      console.log('🔍 Current user:', auth.currentUser)
      
      if (!auth.currentUser) {
        setError('No authenticated user found')
        return
      }

      // Test basic read access
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      console.log('✅ Successfully accessed users collection:', snapshot.size, 'documents')

      // Test user-specific query
      const userQuery = query(usersRef, where('uid', '==', auth.currentUser.uid))
      const userSnapshot = await getDocs(userQuery)
      console.log('✅ Successfully queried user documents:', userSnapshot.size, 'documents')

      setError('')
    } catch (err: any) {
      console.error('❌ Firestore access error:', err)
      setError(`Firestore Error: ${err.message}`)
    }
  }

  if (loading) {
    return <div>Loading Firebase test...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Firebase Debug Info</h3>
      
      <div className="text-sm space-y-2">
        <p><strong>Project ID:</strong> medcare-88ab2</p>
        <p><strong>Auth State:</strong> {user ? `Authenticated (${user.email})` : 'Not authenticated'}</p>
        <p><strong>User UID:</strong> {user?.uid || 'N/A'}</p>
        <p><strong>Auth Token:</strong> {user ? 'Available' : 'N/A'}</p>
      </div>

      <button 
        onClick={testFirestoreAccess}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Firestore Access
      </button>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p>Check browser console for detailed Firebase logs</p>
      </div>
    </div>
  )
}
