import { handlers } from '@/lib/auth'

// Force Node.js runtime since Prisma doesn't work on Edge
export const runtime = 'nodejs'

export const { GET, POST } = handlers
