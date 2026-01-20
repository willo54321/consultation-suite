import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Add timeout to prevent hanging on database connection issues
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    )

    const queryPromise = prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            stakeholders: true,
            feedbackForms: true,
            mapMarkers: true,
          },
        },
      },
    })

    const projects = await Promise.race([queryPromise, timeoutPromise])
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to load projects: ${message}` },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      emailFromName: body.emailFromName || null,
      emailFromAddress: body.emailFromAddress || null,
    },
  })
  return NextResponse.json(project)
}
