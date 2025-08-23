import { type NextRequest, NextResponse } from "next/server"

interface SMSRequest {
  name: string
  phone: string
  email: string
  pestInfo: {
    pest: string
    activityLevel: string
    confidence: string
  }
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json()

    // In a real implementation, you would use Twilio or similar service
    // const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    const message = `Hi ${body.name}! Thanks for using our pest assessment tool. We identified: ${body.pestInfo.pest} (${body.pestInfo.activityLevel} activity). Our team will contact you within 24 hours to discuss treatment options. Reply STOP to opt out.`

    // Mock Twilio SMS sending
    console.log("Sending SMS to:", body.phone)
    console.log("Message:", message)

    // Simulate Twilio API call
    const mockTwilioResponse = {
      sid: "SM" + Math.random().toString(36).substr(2, 9),
      status: "queued",
      to: body.phone,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      body: message,
      dateCreated: new Date().toISOString(),
    }

    // In real implementation:
    // const message = await twilioClient.messages.create({
    //   body: messageText,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: body.phone
    // })

    return NextResponse.json({
      success: true,
      messageId: mockTwilioResponse.sid,
      status: "sent",
    })
  } catch (error) {
    console.error("SMS sending error:", error)
    return NextResponse.json({ success: false, error: "Failed to send SMS" }, { status: 500 })
  }
}
