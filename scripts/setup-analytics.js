console.log("Setting up Google Analytics for Pest Assessment Tool...")

const analyticsConfig = {
  measurementId: "GA_MEASUREMENT_ID", // Replace with actual GA4 Measurement ID
  conversionEvents: [
    {
      name: "assessment_started",
      description: "User started the pest assessment",
    },
    {
      name: "assessment_completed",
      description: "User completed the full assessment",
    },
    {
      name: "results_viewed",
      description: "User viewed their assessment results",
    },
    {
      name: "contact_form_opened",
      description: "User opened the contact form modal",
    },
    {
      name: "lead_generated",
      description: "User submitted contact information (conversion)",
    },
    {
      name: "chatbot_interaction",
      description: "User interacted with the AI chatbot",
    },
  ],
  customDimensions: [
    {
      name: "pest_type",
      description: "Type of pest identified in assessment",
    },
    {
      name: "activity_level",
      description: "Level of pest activity (High/Moderate/Low)",
    },
    {
      name: "confidence_score",
      description: "Confidence level of pest identification",
    },
    {
      name: "contact_type",
      description: "Type of contact requested (call/sms)",
    },
  ],
}

console.log("Analytics Configuration:")
console.log(JSON.stringify(analyticsConfig, null, 2))

console.log("\nTo complete setup:")
console.log("1. Create a Google Analytics 4 property")
console.log("2. Replace GA_MEASUREMENT_ID with your actual measurement ID")
console.log("3. Configure the conversion events in GA4 dashboard")
console.log("4. Set up custom dimensions for enhanced tracking")
console.log("5. Optionally add Facebook Pixel or other tracking pixels")

console.log("\nAnalytics setup script completed!")
