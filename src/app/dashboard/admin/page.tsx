'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import GlassCard from '../../../components/GlassCard'
import RoleColorBadge from '../../../components/RoleColorBadge'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, type DocumentData, type QuerySnapshot } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'pharmacist' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  joinDate: string
  lastLogin: string
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

interface Order {
  id: string
  patientName: string
  medicine: string
  dosage: string
  quantity: number
  doctor: string
  dateOrdered: string
  status: 'pending' | 'processing' | 'ready' | 'delivered'
  price?: number
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalMedicines: number
  lowStockItems: number
  pendingOrders: number
  totalOrders: number
  revenue: number
  prescriptionsToday: number
  criticalStock: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'patient' as User['role'],
    status: 'active' as User['status']
  })
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMedicines: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    totalOrders: 0,
    revenue: 0,
    prescriptionsToday: 0,
    criticalStock: 0
  })

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('joinDate', 'desc'))

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(usersData)

      const activeUsers = usersData.filter(u => u.status === 'active').length
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length,
        activeUsers
      }))
    })

    const medicinesQuery = query(collection(db, 'medicines'), orderBy('name'))

    const unsubscribeMedicines = onSnapshot(medicinesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[]
      setMedicines(medicinesData)

      const criticalStock = medicinesData.filter(m => m.stock <= m.reorderLevel).length
      setStats(prev => ({
        ...prev,
        totalMedicines: medicinesData.length,
        criticalStock
      }))
    })

    const ordersQuery = query(collection(db, 'orders'), orderBy('dateOrdered', 'desc'))

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      setOrders(ordersData)

      const totalOrders = ordersData.length
      const revenue = ordersData.reduce((sum, order) => sum + (order.price || 0), 0)
      setStats(prev => ({
        ...prev,
        totalOrders,
        revenue
      }))
    })

    setLoading(false)

    return () => {
      unsubscribeUsers()
      unsubscribeMedicines()
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

  const updateUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      console.log(`User ${userId} status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email) {
        alert('Please fill in all fields')
        return
      }

      await addDoc(collection(db, 'users'), {
        ...newUser,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })

      setNewUser({
        name: '',
        email: '',
        role: 'patient',
        status: 'active'
      })
      setShowAddUserModal(false)
      console.log('User added successfully')
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user. Please try again.')
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'inventory', label: 'Inventory', icon: '💊' },
    { id: 'reports', label: 'Reports', icon: '📈' }
  ]

  const monthlyData = [
    { month: 'Jan', orders: 1200, revenue: 24000, users: 890 },
    { month: 'Feb', orders: 1350, revenue: 27000, users: 920 },
    { month: 'Mar', orders: 1100, revenue: 22000, users: 950 },
    { month: 'Apr', orders: 1400, revenue: 28000, users: 980 },
    { month: 'May', orders: 1300, revenue: 26000, users: 1010 },
    { month: 'Jun', orders: 1500, revenue: 30000, users: 1050 }
  ]

  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Total Users</h3>
          <p className="text-2xl font-bold text-orange-500">{stats.totalUsers?.toLocaleString() || '0'}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Active Users</h3>
          <p className="text-2xl font-bold text-green-500">{stats.activeUsers?.toLocaleString() || '0'}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-500">{stats.totalOrders?.toLocaleString() || '0'}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Revenue</h3>
          <p className="text-2xl font-bold text-purple-500">${stats.revenue?.toLocaleString() || '0'}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Medicines</h3>
          <p className="text-2xl font-bold text-cyan-500">{stats.totalMedicines || '0'}</p>
        </GlassCard>
        <GlassCard className="!p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">Critical Stock</h3>
          <p className="text-2xl font-bold text-red-500">{stats.criticalStock || '0'}</p>
        </GlassCard>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">Recent User Activity</h2>
              <div className="space-y-3">
                {users.slice(0, 4).map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-800/40 p-3 rounded-lg border border-gray-700">
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-sm text-gray-400">Last: {user.lastLogin}</p>
                      <RoleColorBadge role={user.role} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">System Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Server Status</span>
                  <span className="px-3 py-1 bg-green-600/30 border border-green-600 text-green-200 rounded text-sm font-semibold">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database</span>
                  <span className="px-3 py-1 bg-green-600/30 border border-green-600 text-green-200 rounded text-sm font-semibold">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">API Response Time</span>
                  <span className="text-green-500 font-semibold">45ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Storage Usage</span>
                  <span className="text-yellow-500 font-semibold">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Backup Status</span>
                  <span className="px-3 py-1 bg-green-600/30 border border-green-600 text-green-200 rounded text-sm font-semibold">Complete</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-3 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-white"
              >
                Add New User
              </button>
              <button className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-lg hover:bg-gray-700/60 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white">
                Generate Report
              </button>
              <button className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-lg hover:bg-gray-700/60 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white">
                Backup Database
              </button>
              <button className="px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-lg hover:bg-gray-700/60 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white">
                System Settings
              </button>
            </div>
          </GlassCard>
        </>
      )}

      {activeTab === 'users' && (
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-300">User Management</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-white"
            >
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-gray-400">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-300">{user.email}</td>
                    <td className="py-3 px-4">
                      <RoleColorBadge role={user.role} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-900/30 text-green-200 border border-green-700' :
                        user.status === 'suspended' ? 'bg-red-900/30 text-red-200 border border-red-700' :
                        'bg-gray-900/30 text-gray-200 border border-gray-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{user.joinDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors text-sm font-semibold text-white">
                          Edit
                        </button>
                        {user.status === 'active' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'suspended')}
                            className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors text-sm font-semibold text-white"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm font-semibold text-white"
                          >
                            Activate
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
      )}

      {activeTab === 'inventory' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Inventory Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-300">Total Products</h3>
              <p className="text-2xl font-bold text-orange-500">{medicines.length}</p>
            </div>
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-300">Low Stock Items</h3>
              <p className="text-2xl font-bold text-yellow-500">{medicines.filter(m => m.stock <= m.reorderLevel).length}</p>
            </div>
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2 text-gray-300">Critical Stock</h3>
              <p className="text-2xl font-bold text-red-500">{medicines.filter(m => m.stock <= m.reorderLevel / 2).length}</p>
            </div>
          </div>
          <div className="space-y-3">
            {medicines.filter(m => m.stock <= m.reorderLevel).slice(0, 5).map(med => (
              <div key={med.id} className="flex items-center justify-between bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                <span className="font-semibold text-white">{med.name}</span>
                <div className="flex items-center space-x-4">
                  <span className={med.stock <= med.reorderLevel / 2 ? 'text-red-500' : 'text-yellow-500'}>
                    {med.stock} {med.unit} left
                  </span>
                  <button className="px-3 py-1 orange-gradient rounded hover:shadow-lg transition-all duration-300 text-sm font-semibold text-white">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Monthly Performance</h3>
            <div className="space-y-3">
              {monthlyData.map((data, index) => (
                <div key={index} className="bg-gray-800/40 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{data.month}</span>
                    <span className="text-orange-500 font-bold">${data.revenue.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                    <span>Orders: {data.orders}</span>
                    <span>Users: {data.users}</span>
                    <span>Avg: ${(data.revenue / data.orders).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Generate Reports</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg hover:bg-gray-700/60 transition-colors text-left hover-scale">
                <div className="font-semibold text-white">User Activity Report</div>
                <div className="text-sm text-gray-400">Export all user activities and login patterns</div>
              </button>
              <button className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg hover:bg-gray-700/60 transition-colors text-left hover-scale">
                <div className="font-semibold text-white">Financial Report</div>
                <div className="text-sm text-gray-400">Revenue, expenses, and profit analysis</div>
              </button>
              <button className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg hover:bg-gray-700/60 transition-colors text-left hover-scale">
                <div className="font-semibold text-white">Inventory Report</div>
                <div className="text-sm text-gray-400">Stock levels, reorder points, and supplier performance</div>
              </button>
              <button className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg hover:bg-gray-700/60 transition-colors text-left hover-scale">
                <div className="font-semibold text-white">Prescription Analytics</div>
                <div className="text-sm text-gray-400">Medication trends and prescription patterns</div>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GlassCard className="w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Status</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-white"
              >
                Add User
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </DashboardLayout>
  )
}
