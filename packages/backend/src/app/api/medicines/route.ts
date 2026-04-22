import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    const medicinesRef = collection(db, 'medicines')
    const snapshot = await getDocs(medicinesRef)
    const medicines = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return NextResponse.json({ medicines })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 })
  }
}
