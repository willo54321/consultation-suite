import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  const overlay = await prisma.imageOverlay.create({
    data: {
      projectId: params.id,
      name: body.name,
      imageUrl: body.imageUrl,
      southLat: body.bounds[0][0],
      westLng: body.bounds[0][1],
      northLat: body.bounds[1][0],
      eastLng: body.bounds[1][1],
      opacity: body.opacity ?? 0.7,
      visible: body.visible ?? true,
    }
  })

  return NextResponse.json({
    id: overlay.id,
    name: overlay.name,
    imageUrl: overlay.imageUrl,
    bounds: [[overlay.southLat, overlay.westLng], [overlay.northLat, overlay.eastLng]],
    opacity: overlay.opacity,
    visible: overlay.visible,
  })
}
