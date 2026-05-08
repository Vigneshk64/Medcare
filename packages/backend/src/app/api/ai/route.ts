import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'minimax/minimax-m2.5:free'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const medicineDatabase = [
  { name: 'Aspirin', type: 'Pain Relief', interactions: ['Ibuprofen', 'Warfarin'], sideEffects: 'Stomach bleeding, nausea' },
  { name: 'Paracetamol', type: 'Pain Relief', interactions: ['Alcohol', 'Warfarin'], sideEffects: 'Liver damage in high doses' },
  { name: 'Ibuprofen', type: 'Pain Relief', interactions: ['Aspirin', 'Warfarin'], sideEffects: 'Stomach ulcers, kidney problems' },
  { name: 'Amoxicillin', type: 'Antibiotic', interactions: ['Methotrexate'], sideEffects: 'Rash, diarrhea' },
  { name: 'Metformin', type: 'Diabetes', interactions: ['Alcohol'], sideEffects: 'Nausea, lactic acidosis' },
  { name: 'Lisinopril', type: 'Blood Pressure', interactions: ['Potassium supplements'], sideEffects: 'Dizziness, dry cough' },
  { name: 'Atorvastatin', type: 'Cholesterol', interactions: ['Grapefruit'], sideEffects: 'Muscle pain, liver problems' },
  { name: 'Omeprazole', type: 'Acid Reflux', interactions: ['Clopidogrel'], sideEffects: 'Headache, diarrhea' },
  { name: 'Cetirizine', type: 'Allergy', interactions: ['Alcohol'], sideEffects: 'Drowsiness, dry mouth' },
  { name: 'Salbutamol', type: 'Asthma', interactions: ['Beta blockers'], sideEffects: 'Tremors, palpitations' },
  { name: 'Azithromycin', type: 'Antibiotic', interactions: ['Antacids'], sideEffects: 'Nausea, abdominal pain' },
  { name: 'Metoprolol', type: 'Heart', interactions: ['Salbutamol'], sideEffects: 'Fatigue, bradycardia' },
  { name: 'Vitamin D3', type: 'Supplement', interactions: ['Digoxin'], sideEffects: 'Hypercalcemia' },
  { name: 'Cough Syrup', type: 'Cough', interactions: ['Alcohol'], sideEffects: 'Drowsiness, dizziness' },
  { name: 'Insulin', type: 'Diabetes', interactions: ['Beta blockers'], sideEffects: 'Hypoglycemia' },
]

const nonMedicalKeywords = [
  'movie', 'film', 'music', 'song', 'game', 'sports', 'football', 'tennis',
  'basketball', 'news', 'weather', 'politics', 'technology', 'car', 'travel',
  'food', 'recipe', 'cooking', 'art', 'history', 'novel', 'book', 'celebrity',
  'actor', 'director', 'singer', 'band', 'concert', 'airport', 'flight',
  'hotel', 'restaurant', 'shopping', 'fashion', 'makeup', 'beauty',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, medicines, type } = body

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    if (message && nonMedicalKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return NextResponse.json(
        { success: false, response: '🚫 I only handle medical queries. Please ask about medicines, interactions, or prescriptions.' },
        { status: 200 }
      )
    }

    let systemPrompt = ''
    let userMessage = message

    if (type === 'drugInteraction') {
      systemPrompt = `You are a medical AI assistant specializing in drug interactions. Medicine database:
${JSON.stringify(medicineDatabase)}
Provide clear drug interaction info. Always add disclaimer this is not medical advice.`

      userMessage = `Check drug interactions between: ${medicines?.join(', ') || message}.
Provide:
1. Dangerous interactions
2. Severity (Low/Medium/High)
3. Recommendations`

    } else if (type === 'medicineInfo') {
      systemPrompt = `You are a medical AI assistant. Medicine database:
${JSON.stringify(medicineDatabase)}
Provide accurate medicine information. Always add disclaimer to consult a doctor.`

      userMessage = message

    } else if (type === 'prescriptionAnalysis') {
      systemPrompt = `You are a medical AI specializing in prescription analysis. Medicine database:
${JSON.stringify(medicineDatabase)}
Analyze prescriptions for interactions, dosages, safety. Always add disclaimer.`

      userMessage = `Analyze this prescription: ${message}
Provide:
1. Summary of medicines
2. Potential concerns
3. Recommendations`

    } else {
      systemPrompt = `You are MedCare AI assistant for a healthcare platform. Medicine database:
${JSON.stringify(medicineDatabase)}
Answer only medical questions. Always add disclaimer to consult healthcare provider.`

      userMessage = message
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://medcare-nine-theta.vercel.app',
        'X-Title': 'MedCare AI Assistant',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter error:', errorData)
      return NextResponse.json(
        { error: 'AI service error', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated'

    return NextResponse.json({
      success: true,
      response: aiResponse,
      type: type || 'general'
    })

  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MedCare AI API is running',
    models: OPENROUTER_MODEL
  })
}