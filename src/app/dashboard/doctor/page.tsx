'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import GlassCard from '../../../components/GlassCard'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  name: string
  age: number
  email: string
  lastVisit: string
  condition: string
}

interface PrescriptionForm {
  patientId: string
  medicine: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPatients: 0,
    prescriptionsToday: 0,
    appointmentsToday: 0
  })

  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
    patientId: '',
    medicine: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const patientsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'patient')
    )

    const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[]
      setPatients(patientsData)
      setStats(prev => ({ ...prev, totalPatients: patientsData.length }))
    })

    const prescriptionsQuery = query(
      collection(db, 'prescriptions'),
      where('doctorId', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribePrescriptions = onSnapshot(prescriptionsQuery, (snapshot) => {
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]
      setPrescriptions(prescriptionsData)

      const today = new Date().toISOString().split('T')[0]
      const todayCount = prescriptionsData.filter(p => p.date === today).length
      setStats(prev => ({ ...prev, prescriptionsToday: todayCount }))
    })

    setLoading(false)

    return () => {
      unsubscribePatients()
      unsubscribePrescriptions()
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

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = auth.currentUser
      if (!user) return

      await addDoc(collection(db, 'prescriptions'), {
        ...prescriptionForm,
        doctorId: user.uid,
        doctor: user.displayName || 'Doctor',
        date: new Date().toISOString(),
        status: 'active'
      })

      setPrescriptionForm({
        patientId: '',
        medicine: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      })
      console.log('Prescription submitted successfully')
    } catch (error) {
      console.error('Error submitting prescription:', error)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'write-prescription', label: 'Write Prescription', icon: '📝' },
    { id: 'patient-history', label: 'Patient History', icon: '📋' }
  ]

  const handleInputChange = (field: keyof PrescriptionForm, value: string) => {
    setPrescriptionForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout
      role="doctor"
      title="Doctor Dashboard"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Total Patients</h3>
              <p className="text-3xl font-bold text-blue-500">{stats.totalPatients}</p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Prescriptions Today</h3>
              <p className="text-3xl font-bold text-green-500">{stats.prescriptionsToday}</p>
            </GlassCard>
            <GlassCard>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Appointments Today</h3>
              <p className="text-3xl font-bold text-purple-500">{stats.appointmentsToday}</p>
            </GlassCard>
          </div>

          {/* Recent Patients */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Recent Patients</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No patients found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400">Last Visit</th>
                      <th className="text-left py-3 px-4 text-gray-400">Condition</th>
                      <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.slice(0, 5).map(patient => (
                      <tr key={patient.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 text-white">{patient.name || 'Patient'}</td>
                        <td className="py-3 px-4 text-gray-300">{patient.email}</td>
                        <td className="py-3 px-4 text-gray-300">{patient.lastVisit || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-300">{patient.condition || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedPatient(patient.id)}
                            className="px-3 py-1 orange-gradient rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm font-semibold text-white"
                          >
                            View Details
                          </button>
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

      {activeTab === 'write-prescription' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Write Prescription</h2>
          <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Patient</label>
                <select
                  value={prescriptionForm.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Medicine</label>
                <input
                  type="text"
                  value={prescriptionForm.medicine}
                  onChange={(e) => handleInputChange('medicine', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="e.g., Amoxicillin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Dosage</label>
                <input
                  type="text"
                  value={prescriptionForm.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Frequency</label>
                <input
                  type="text"
                  value={prescriptionForm.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="e.g., Twice daily"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Duration</label>
                <input
                  type="text"
                  value={prescriptionForm.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="e.g., 7 days"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-400">Instructions</label>
                <textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Additional instructions..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 blue-gradient rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #3B82F6, #0ea5e9)' }}
              >
                Submit Prescription
              </button>
              <button
                type="button"
                onClick={() => setPrescriptionForm({
                  patientId: '',
                  medicine: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  instructions: ''
                })}
                className="px-6 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl hover:bg-gray-700/60 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 font-semibold text-white"
              >
                Clear Form
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {activeTab === 'patient-history' && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Patient History</h2>
          <div className="mb-4">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPatient ? (
            <div className="space-y-4">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 text-white">Medical History</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Previous medications: Metformin, Lisinopril</li>
                  <li>• Allergies: Penicillin, Sulfa drugs</li>
                  <li>• Chronic conditions: Hypertension, Diabetes</li>
                  <li>• Last lab results: Normal range</li>
                </ul>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 text-white">Prescription History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-white">Amoxicillin 500mg</span>
                    <span className="text-sm text-gray-400">2024-01-15</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-white">Lisinopril 10mg</span>
                    <span className="text-sm text-gray-400">2024-01-10</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white">Metformin 500mg</span>
                    <span className="text-sm text-gray-400">2024-01-05</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a patient to view their history</p>
          )}
        </GlassCard>
      )}
    </DashboardLayout>
  )
}
