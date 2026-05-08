// Backend API temporarily disabled due to TypeScript configuration issues
// Main Firebase functionality works in frontend components
export async function GET() {
  return Response.json({ error: 'API temporarily disabled - use frontend Firebase instead' }, { status: 503 })
}
