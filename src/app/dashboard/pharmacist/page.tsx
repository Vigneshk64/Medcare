'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import GlassCard from '../../../components/GlassCard'
import StatusBadge from '../../../components/StatusBadge'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  patientName: string
  medicine: string
  dosage: string
  quantity: number
  doctor: string
  dateOrdered: string
  status: 'pending' | 'processing' | 'ready' | 'delivered'
  urgency: 'normal' | 'urgent'
}

interface Medicine {
  id: string
  name: string
  stock: number
  unit: string
  reorderLevel: number
  price: number
  supplier: string
  lastRestocked: string
}

export default function PharmacistDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingOrders: 0,
    processingOrders: 0,
    readyOrders: 0,
    lowStockItems: 0
  })

  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('dateOrdered', 'desc')
    )

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      setOrders(ordersData)

      const pendingCount = ordersData.filter(o => o.status === 'pending').length
      const processingCount = ordersData.filter(o => o.status === 'processing').length
      const readyCount = ordersData.filter(o => o.status === 'ready').length

      setStats(prev => ({
        ...prev,
        pendingOrders: pendingCount,
        processingOrders: processingCount,
        readyOrders: readyCount
      }))
    })

    const medicinesQuery = query(
      collection(db, 'medicines'),
      orderBy('name')
    )

    const unsubscribeMedicines = onSnapshot(medicinesQuery, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[]
      setMedicines(medicinesData)

      const lowStockCount = medicinesData.filter(m => m.stock <= m.reorderLevel).length
      setStats(prev => ({
        ...prev,
        lowStockItems: lowStockCount
      }))
    })

    setLoading(false)

    return () => {
      unsubscribeOrders()
      unsubscribeMedicines()
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

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      console.log(`Order ${orderId} status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const reorderStock = async (medicineId: string) => {
    try {
      const medicine = medicines.find(m => m.id === medicineId)
      if (!medicine) return

      await updateDoc(doc(db, 'medicines', medicineId), {
        stock: medicine.reorderLevel * 2,
        lastRestocked: new Date().toISOString()
      })
      console.log(`Stock reordered for medicine ${medicineId}`)
    } catch (error) {
      console.error('Error reordering stock:', error)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'process-orders', label: 'Process Orders', icon: '📦' },
    { id: 'stock-management', label: 'Stock Management', icon: '💊' }
  ]

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock <= reorderLevel / 2) return { color: 'text-red-500', label: 'Critical' }
    if (stock <= reorderLevel) return { color: 'text-yellow-500', label: 'Low' }
    return { color: 'text-green-500', label: 'Good' }
  }

  return (
    <DashboardLayout
      role="pharmacist"
      title="Pharmacist Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-500">{stats.pendingOrders}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Processing</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.processingOrders}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Ready for Pickup</h3>
          <p className="text-3xl font-bold text-green-500">{stats.readyOrders}</p>
        </GlassCard>
        <GlassCard>
          <h3 className="text-lg font-semibold mb-2 text-gray-300">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-500">{stats.lowStockItems}</p>
        </GlassCard>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Pending Orders Queue */}
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Pending Orders Queue</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Patient</th>
                    <th className="text-left py-3 px-4 text-gray-400">Medicine</th>
                    <th className="text-left py-3 px-4 text-gray-400">Qty</th>
                    <th className="text-left py-3 px-4 text-gray-400">Doctor</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Urgency</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status === 'pending' || o.status === 'processing').map(order => (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                      <td className="py-3 px-4 text-white">{order.patientName}</td>
                      <td className="py-3 px-4 text-gray-300">{order.medicine} {order.dosage}</td>
                      <td className="py-3 px-4 text-gray-300">{order.quantity}</td>
                      <td className="py-3 px-4 text-gray-300">{order.doctor}</td>
                      <td className="py-3 px-4 text-gray-300">{order.dateOrdered}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${
                          order.urgency === 'urgent' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {order.urgency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm font-semibold text-white"
                            >
                              Process
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm font-semibold text-white"
                            >
                              Ready
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Low Stock Alerts */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Low Stock Alerts</h2>
            <div className="space-y-3">
              {medicines.filter(med => med.stock <= med.reorderLevel).map(medicine => {
                const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel)
                return (
                  <div key={medicine.id} className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-white">{medicine.name}</span>
                      <span className={`font-semibold ${stockStatus.color}`}>
                        {medicine.stock} {medicine.unit} left
                      </span>
                    </div>
                    <button
                      onClick={() => reorderStock(medicine.id)}
                      className="px-4 py-2 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-white"
                    >
                      Reorder
                    </button>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'process-orders' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">All Orders</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No orders found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Patient</th>
                    <th className="text-left py-3 px-4 text-gray-400">Medicine</th>
                    <th className="text-left py-3 px-4 text-gray-400">Dosage</th>
                    <th className="text-left py-3 px-4 text-gray-400">Qty</th>
                    <th className="text-left py-3 px-4 text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-white">{order.patientName}</td>
                      <td className="py-3 px-4 text-gray-300">{order.medicine}</td>
                      <td className="py-3 px-4 text-gray-300">{order.dosage}</td>
                      <td className="py-3 px-4 text-gray-300">{order.quantity}</td>
                      <td className="py-3 px-4 text-gray-300">{order.dateOrdered}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status as any} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="px-3 py-1 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-semibold text-white"
                            >
                              Process
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 text-sm font-semibold text-white"
                            >
                              Ready
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </GlassCard>
      )}

      {activeTab === 'stock-management' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Medicine Inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Medicine</th>
                  <th className="text-left py-3 px-4 text-gray-400">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-400">Unit</th>
                  <th className="text-left py-3 px-4 text-gray-400">Reorder Level</th>
                  <th className="text-left py-3 px-4 text-gray-400">Price</th>
                  <th className="text-left py-3 px-4 text-gray-400">Supplier</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(medicine => {
                  const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel)
                  return (
                    <tr key={medicine.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 text-white">{medicine.name}</td>
                      <td className="py-3 px-4 text-gray-300">{medicine.stock}</td>
                      <td className="py-3 px-4 text-gray-300">{medicine.unit}</td>
                      <td className="py-3 px-4 text-gray-300">{medicine.reorderLevel}</td>
                      <td className="py-3 px-4 text-gray-300">${medicine.price}</td>
                      <td className="py-3 px-4 text-gray-300">{medicine.supplier}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="px-3 py-1 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-semibold text-white">
                          Update
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </DashboardLayout>
  )
}
