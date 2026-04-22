// Shared types and utilities
export interface Medicine {
  id: string
  name: string
  quantity: number
  dosage?: string
  unit?: string
  aliases?: string[]
}

export interface User {
  uid: string
  email: string
  displayName?: string
  role: 'doctor' | 'admin' | 'delivery' | 'customer'
}

export interface DoctorRequest {
  id: string
  requestedBy: string
  doctorEmail: string
  patientName: string
  patientPhone: string
  medicines: Array<{
    medicineId: string
    medicineName: string
    quantity: number
  }>
  status: 'Pending' | 'Approved' | 'Delivered' | 'Rejected'
  date: string
  createdAt: Date
}
