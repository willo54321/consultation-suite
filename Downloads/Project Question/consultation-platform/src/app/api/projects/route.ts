import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
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
