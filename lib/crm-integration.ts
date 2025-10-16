interface ContactSubmission {
  name: string
  email: string
  phone: string
  preferredTime?: string
  notes: string
  contactType: "call"
  pestInfo: {
    pest: string
    activityLevel: string
    confidence: string
  }
  assessmentAnswers: any
  submittedAt: string
}

// Mock CRM integration - replace with actual CRM API calls
export async function submitToGoogleSheets(data: ContactSubmission) {
  // In a real implementation, this would use Google Sheets API
  console.log("Submitting to Google Sheets:", data)

  // Example structure for Google Sheets integration:
  const sheetData = [
    data.submittedAt,
    data.name,
    data.email,
    data.phone,
    data.contactType,
    data.preferredTime || "",
    data.pestInfo.pest,
    data.pestInfo.activityLevel,
    data.pestInfo.confidence,
    data.notes,
    JSON.stringify(data.assessmentAnswers),
  ]

  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1000)
  })
}

export async function submitToCRM(data: ContactSubmission) {
  // In a real implementation, this would integrate with CRM like HubSpot, Salesforce, etc.
  console.log("Submitting to CRM:", data)

  const crmPayload = {
    contact: {
      firstName: data.name.split(" ")[0],
      lastName: data.name.split(" ").slice(1).join(" "),
      email: data.email,
      phone: data.phone,
    },
    deal: {
      dealName: `Pest Control - ${data.pestInfo.pest}`,
      dealStage: "New Lead",
      priority: data.pestInfo.activityLevel === "Severe" ? "High" : "Medium",
    },
    notes: [
      `Assessment Results: ${data.pestInfo.pest} (${data.pestInfo.confidence} confidence)`,
      `Activity Level: ${data.pestInfo.activityLevel}`,
      `Contact Preference: ${data.contactType}`,
      `Preferred Time: ${data.preferredTime || "Not specified"}`,
      `Additional Notes: ${data.notes}`,
    ].join("\n"),
    customFields: {
      pestType: data.pestInfo.pest,
      activityLevel: data.pestInfo.activityLevel,
      assessmentData: JSON.stringify(data.assessmentAnswers),
    },
  }

  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, leadId: "LEAD_" + Date.now() }), 1000)
  })
}
