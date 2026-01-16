import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()

  // Create the feedback response
  const response = await prisma.feedbackResponse.create({
    data: {
      formId: params.id,
      data: body.data,
    },
  })

  // Get the form to find the project ID and field definitions
  const form = await prisma.feedbackForm.findUnique({
    where: { id: params.id },
    select: {
      projectId: true,
      fields: true,
    },
  })

  if (form) {
    // Look for email fields in the response data
    const fields = form.fields as Array<{ id: string; type: string; label: string }>
    const responseData = body.data as Record<string, string>

    let email: string | null = null
    let name: string | null = null

    // Find email and name fields
    for (const field of fields) {
      const value = responseData[field.id]
      if (!value) continue

      if (field.type === 'email' || field.label.toLowerCase().includes('email')) {
        email = value.toLowerCase()
      }
      if (field.label.toLowerCase().includes('name') && !field.label.toLowerCase().includes('email')) {
        name = value
      }
    }

    // Add to mailing list if email found
    if (email) {
      try {
        await prisma.subscriber.upsert({
          where: {
            projectId_email: {
              projectId: form.projectId,
              email: email,
            },
          },
          create: {
            projectId: form.projectId,
            email: email,
            name: name,
            source: 'feedback_form',
            sourceId: response.id,
          },
          update: {
            // If they re-submit, update name if provided
            name: name || undefined,
            // Re-subscribe if they had unsubscribed
            subscribed: true,
            unsubscribedAt: null,
          },
        })
      } catch (error) {
        // Don't fail the form submission if subscriber creation fails
        console.error('Failed to add subscriber from feedback form:', error)
      }
    }
  }

  return NextResponse.json(response)
}
