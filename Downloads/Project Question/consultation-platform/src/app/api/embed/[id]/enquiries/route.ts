import { prisma } from '@/lib/db'
import { sendNewEnquiryNotification } from '@/lib/email'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verify project exists and has embed enabled, also get team members
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      embedEnabled: true,
      name: true,
      emailFromName: true,
      emailFromAddress: true,
      teamMembers: {
        select: { email: true },
      },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (!project.embedEnabled) {
    return NextResponse.json({ error: 'Enquiries not enabled' }, { status: 403 })
  }

  const body = await request.json()

  // Basic validation
  if (!body.submitterName || !body.submitterEmail || !body.subject || !body.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      projectId: params.id,
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      submitterPhone: body.submitterPhone || null,
      submitterOrg: body.submitterOrg || null,
      subject: body.subject,
      message: body.message,
      category: body.category || 'general',
    },
  })

  // Auto-log engagement if submitter email matches a stakeholder
  const matchingStakeholder = await prisma.stakeholder.findFirst({
    where: {
      projectId: params.id,
      email: {
        equals: body.submitterEmail,
        mode: 'insensitive',
      },
    },
  })

  if (matchingStakeholder) {
    await prisma.stakeholderEngagement.create({
      data: {
        stakeholderId: matchingStakeholder.id,
        type: 'inbound_email',
        title: `Enquiry received: ${body.subject}`,
        description: body.message.substring(0, 500) + (body.message.length > 500 ? '...' : ''),
        date: new Date(),
        outcome: 'Enquiry submitted via public form',
      },
    })
  }

  // Send notification to team members
  const teamEmails = project.teamMembers.map(m => m.email).filter(Boolean)
  if (teamEmails.length > 0) {
    const headersList = headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const enquiryUrl = `${protocol}://${host}/projects/${params.id}?tab=enquiries&enquiry=${enquiry.id}`

    await sendNewEnquiryNotification({
      to: teamEmails,
      projectName: project.name,
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      subject: body.subject,
      message: body.message,
      category: body.category || 'general',
      enquiryUrl,
      projectEmailFromName: project.emailFromName,
      projectEmailFromAddress: project.emailFromAddress,
    })
  }

  return NextResponse.json({
    success: true,
    reference: enquiry.id,
    message: 'Your enquiry has been submitted successfully.',
  })
}
