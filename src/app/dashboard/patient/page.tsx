'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import FirebaseTest from '../../../components/FirebaseTest'
import AIAssistant from '../../../components/AIAssistant'
import GlassCard from '../../../components/GlassCard'
import StatusBadge from '../../../components/StatusBadge'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface Prescription {
  id: string
  medicine: string
  dosage: string
  doctor: string
  date: string
  status: 'active' | 'completed' | 'pending' | 'delivered'
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activePrescriptions: 0,
    deliveredOrders: 0,
    pendingReview: 0
  })

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prescription[]
      setPrescriptions(prescriptionsData)

      const activeCount = prescriptionsData.filter(p => p.status === 'active').length
      const deliveredCount = prescriptionsData.filter(p => p.status === 'delivered').length
      const pendingCount = prescriptionsData.filter(p => p.status === 'pending').length

      setStats({
        activePrescriptions: activeCount,
        deliveredOrders: deliveredCount,
        pendingReview: pendingCount
      })
    })

    const ordersQuery = query(
      collection(db, 'orders'),
      where('patientId', '==', user.uid),
      orderBy('dateOrdered', 'desc')
    )

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrders(ordersData)
    })

    setLoading(false)

    return () => {
      unsubscribePrescriptions()
      unsubscribeOrders()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleRequestRefill = async (prescription: Prescription) => {
    try {
      const user = auth.currentUser
      if (!user) return

      await addDoc(collection(db, 'orders'), {
        patientId: user.uid,
        medicine: prescription.medicine,
        dosage: prescription.dosage,
        doctor: prescription.doctor,
        dateOrdered: new Date().toISOString(),
        status: 'pending',
        type: 'refill'
      })
      console.log('Refill requested successfully')
    } catch (error) {
      console.error('Error requesting refill:', error)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' }
  ]

  return (
    <DashboardLayout
      role="patient"
      title="Patient Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      <FirebaseTest />

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Active Prescriptions</h3>
              <p className="text-3xl font-bold text-orange-500">{stats.activePrescriptions}</p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Delivered Orders</h3>
              <p className="text-3xl font-bold text-green-500">{stats.deliveredOrders}</p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Pending Review</h3>
              <p className="text-3xl font-bold text-yellow-500">{stats.pendingReview}</p>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => prescriptions.length > 0 && handleRequestRefill(prescriptions[0])}
                disabled={prescriptions.length === 0}
                className="px-4 py-3 orange-gradient rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                Request Refill
              </button>
              <button
                onClick={() => router.push('/dashboard/patient?tab=appointments')}
                className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl hover:bg-gray-700/60 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white"
              >
                Book Appointment
              </button>
              <button
                onClick={() => router.push('/dashboard/patient?tab=lab-results')}
                className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl hover:bg-gray-700/60 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white"
              >
                View Lab Results
              </button>
            </div>
          </GlassCard>

          {/* Recent Prescriptions */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Recent Prescriptions</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No prescriptions found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400">Medicine</th>
                      <th className="text-left py-3 px-4 text-gray-400">Dosage</th>
                      <th className="text-left py-3 px-4 text-gray-400">Doctor</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.slice(0, 5).map(prescription => (
                      <tr key={prescription.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 text-white">{prescription.medicine}</td>
                        <td className="py-3 px-4 text-gray-300">{prescription.dosage}</td>
                        <td className="py-3 px-4 text-gray-300">{prescription.doctor}</td>
                        <td className="py-3 px-4 text-gray-300">{prescription.date}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={prescription.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'prescriptions' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">All Prescriptions</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No prescriptions found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Medicine</th>
                    <th className="text-left py-3 px-4 text-gray-400">Dosage</th>
                    <th className="text-left py-3 px-4 text-gray-400">Doctor</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(prescription => (
                    <tr key={prescription.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-white">{prescription.medicine}</td>
                      <td className="py-3 px-4 text-gray-300">{prescription.dosage}</td>
                      <td className="py-3 px-4 text-gray-300">{prescription.doctor}</td>
                      <td className="py-3 px-4 text-gray-300">{prescription.date}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={prescription.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      )}

      {activeTab === 'orders' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">My Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">{order.medicine}</p>
                      <p className="text-gray-400 text-sm">{order.dosage}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'ai-assistant' && (
        <div className="h-96">
          <AIAssistant type="general" />
        </div>
      )}
    </DashboardLayout>
  )
}
