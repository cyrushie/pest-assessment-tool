import { type NextRequest, NextResponse } from "next/server"

interface CallRequest {
  name: string
  phone: string
  email: string
  preferredTime?: string
  pestInfo: {
    pest: string
    activityLevel: string
    confidence: string
  }
  notes?: string
  assessmentAnswers: any
}

export async function POST(request: NextRequest) {
  try {
    const body: CallRequest = await request.json()

    // Create a calendar event or CRM task for the sales team
    const callSchedule = {
      id: "CALL_" + Date.now(),
      customerName: body.name,
      customerPhone: body.phone,
      customerEmail: body.email,
      preferredTime: body.preferredTime || "Any time",
      pestType: body.pestInfo.pest,
      activityLevel: body.pestInfo.activityLevel,
      confidence: body.pestInfo.confidence,
      notes: body.notes,
      priority: body.pestInfo.activityLevel === "High" ? "urgent" : "normal",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    // In a real implementation, this would:
    // 1. Create a calendar event in Google Calendar or Outlook
    // 2. Add a task to CRM (HubSpot, Salesforce, etc.)
    // 3. Send notification to sales team
    // 4. Optionally send confirmation email to customer

    console.log("Call scheduled:", callSchedule)

    // Mock calendar/CRM integration
    await mockCalendarIntegration(callSchedule)
    await mockCRMIntegration(callSchedule, body.assessmentAnswers)

    // Send confirmation email (mock)
    await mockSendConfirmationEmail(body)

    return NextResponse.json({
      success: true,
      callId: callSchedule.id,
      scheduledFor: callSchedule.scheduledFor,
      status: "scheduled",
    })
  } catch (error) {
    console.error("Call scheduling error:", error)
    return NextResponse.json({ success: false, error: "Failed to schedule call" }, { status: 500 })
  }
}

async function mockCalendarIntegration(callData: any) {
  // In real implementation, use Google Calendar API or similar
  console.log("Creating calendar event:", {
    title: `Pest Consultation - ${callData.customerName}`,
    description: `Pest: ${callData.pestType}, Activity: ${callData.activityLevel}`,
    attendees: [callData.customerEmail],
    start: callData.scheduledFor,
    duration: 30, // minutes
  })

  return new Promise((resolve) => setTimeout(resolve, 500))
}

async function mockCRMIntegration(callData: any, assessmentData: any) {
  // In real implementation, integrate with CRM API
  console.log("Creating CRM lead:", {
    name: callData.customerName,
    phone: callData.customerPhone,
    email: callData.customerEmail,
    source: "Pest Assessment Tool",
    dealValue: callData.activityLevel === "High" ? 500 : 300,
    customFields: {
      pestType: callData.pestType,
      activityLevel: callData.activityLevel,
      assessmentData: JSON.stringify(assessmentData),
    },
  })

  return new Promise((resolve) => setTimeout(resolve, 500))
}

async function mockSendConfirmationEmail(customerData: any) {
  // In real implementation, use email service like SendGrid, Mailgun, etc.
  console.log("Sending confirmation email to:", customerData.email)
  console.log("Email content:", {
    subject: "Pest Consultation Scheduled - We'll Call You Soon!",
    body: `Hi ${customerData.name}, we've received your pest assessment and will call you within 24 hours to discuss treatment options for your ${customerData.pestInfo.pest} issue.`,
  })

  return new Promise((resolve) => setTimeout(resolve, 300))
}
