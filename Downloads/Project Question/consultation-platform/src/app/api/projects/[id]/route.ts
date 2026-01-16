import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      stakeholders: true,
      mapMarkers: true,
      feedbackForms: {
        include: {
          _count: { select: { responses: true } },
        },
      },
      imageOverlays: {
        orderBy: { createdAt: 'asc' }
      },
      publicPins: {
        orderBy: { createdAt: 'desc' }
      },
      teamMembers: {
        orderBy: { createdAt: 'asc' }
      },
      enquiries: {
        include: { assignedTo: true },
        orderBy: { createdAt: 'desc' }
      },
      subscribers: {
        where: { subscribed: true },
        orderBy: { createdAt: 'desc' }
      },
    },
  })
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  // Build update data, only including fields that were explicitly provided
  const updateData: Record<string, unknown> = {}

  if (body.name !== undefined) updateData.name = body.name
  if (body.description !== undefined) updateData.description = body.description
  if (body.latitude !== undefined) updateData.latitude = body.latitude
  if (body.longitude !== undefined) updateData.longitude = body.longitude
  if (body.mapZoom !== undefined) updateData.mapZoom = body.mapZoom
  if (body.embedEnabled !== undefined) updateData.embedEnabled = body.embedEnabled
  if ('emailFromName' in body) updateData.emailFromName = body.emailFromName || null
  if ('emailFromAddress' in body) updateData.emailFromAddress = body.emailFromAddress || null

  const project = await prisma.project.update({
    where: { id: params.id },
    data: updateData,
  })
  return NextResponse.json(project)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.project.delete({
    where: { id: params.id },
  })
  return NextResponse.json({ success: true })
}
