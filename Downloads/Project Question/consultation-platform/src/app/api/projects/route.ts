import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json(
      { error: 'Failed to load projects. Please check database connection.' },
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
