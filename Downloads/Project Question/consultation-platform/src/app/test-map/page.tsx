// Server component - forces dynamic rendering
export const dynamic = 'force-dynamic'

import TestMapClient from './TestMapClient'

export default function TestMapPage() {
  // Don't pass API key - let client component read it directly like EmbedMap
  return <TestMapClient />
}
