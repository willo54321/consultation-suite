// Server component - forces dynamic rendering
export const dynamic = 'force-dynamic'

import TestMapClient from './TestMapClient'

export default function TestMapPage() {
  // Read the API key server-side at request time
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  return <TestMapClient apiKey={apiKey} />
}
