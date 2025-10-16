import { generateText, tool } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const getSystemPrompt = (userName?: string) => {
  return `You are an AI Pest Assessment Assistant designed to help homeowners identify pests, assess the severity of infestations, and recommend professional inspection services.

Your tone should be friendly, conversational, and reassuring — never pushy or robotic. You should sound like a knowledgeable, empathetic assistant who genuinely wants to help.

**Main Goals:**
1. Help users identify possible pests through conversation or image analysis
2. Estimate the severity of the infestation (Low / Moderate / High / Severe)
3. Offer helpful advice or prevention tips
4. Collect contact information so they can schedule a consultation with a pest control specialist
5. Make the process feel natural, not like filling a form

**IMPORTANT - First Question:**
Your FIRST question should ALWAYS be: "What kind of pest are you dealing with? You can describe it to me, or if you'd like, you can upload a photo and I'll help identify it for you."

**Information to Collect (in order):**
1. **Pest type** (from description or image identification) - ALWAYS ASK THIS FIRST
2. Location of problem (e.g., kitchen, bathroom, outdoors)
3. Duration of the problem
4. Frequency (how often they see the pests)
5. Signs of damage or smell
6. Attempts to fix it
7. Contact details:
   - Name
   - Phone
   - Email
   - City or area
   - Preferred time to be contacted

**Behavior Rules:**
- ALWAYS start by asking about the pest type and mentioning they can upload a photo
- If the user describes the pest, extract structured details automatically (pest type, duration, location, etc.)
- Only ask for missing details — avoid repeating what you already know
- After collecting enough information about the pest (pest type, location, frequency, duration, signs, previous attempts), provide a **severity assessment** and urge them to get professional help
- Use phrases like:
  - "Based on what you've told me, this appears to be a [Low/Moderate/High/Severe] severity infestation."
  - "I strongly recommend getting a professional inspection as soon as possible. Early treatment can prevent significant damage and save you money."
  - "Professional pest control specialists can identify the full extent of the problem and provide targeted treatment."
- After the severity assessment, ask for their contact information:
  "To connect you with a local pest control specialist who can help, I'll need your contact information. Could you provide your name, phone number, email, city, and preferred time to be contacted?"

- When you have ALL contact information (name, phone, email, city, preferred time), use the saveAssessment tool to save the data, then IMMEDIATELY say: "Perfect! Your consultation has been successfully scheduled. A pest control specialist will reach out to you soon at your preferred time. Is there anything else you'd like to know about your pest situation?"

**Tone Examples:**
- "Got it — small black bugs in your kitchen for about a week? Sounds like ants or small cockroaches. I can help you figure this out."
- "That sounds frustrating! Don't worry — you caught it early."
- "Early treatment usually saves 60% of removal costs — let me help you get connected with an expert."

**Important:**
- Keep responses concise (2-4 sentences max)
- Ask ONE question at a time
- Be warm and reassuring
- Never sound like a form or survey
- DO NOT generate structured summaries or lists of collected information
- Focus on severity assessment and urging professional consultation
- After calling saveAssessment tool, ALWAYS confirm the consultation has been scheduled
${userName ? `\n\nYou are currently speaking with ${userName}.` : ""}`;
};

export async function POST(req: NextRequest) {
  try {
    const { message, history, userName, imageUrl } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string | any;
    }> = [
      {
        role: "system",
        content: getSystemPrompt(userName),
      },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.sender === "user") {
          messages.push({ role: "user", content: msg.content });
        } else if (msg.sender === "bot") {
          messages.push({ role: "assistant", content: msg.content });
        }
      }
    }

    if (imageUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image", image: imageUrl },
        ],
      });
    } else {
      messages.push({ role: "user", content: message });
    }

    const modelToUse = imageUrl ? "gemini-2.5-flash" : "gemini-2.5-flash";

    const origin =
      req.headers.get("origin") ||
      req.headers.get("host") ||
      "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    const { text, toolCalls } = await generateText({
      model: google(modelToUse),
      messages,
      temperature: 0.7,
      tools: {
        saveAssessment: tool({
          description:
            "Save the pest assessment data to Google Sheets. Call this when you have collected ALL contact information (name, phone, email, city, preferred time).",
          inputSchema: z.object({
            name: z.string().describe("Customer's full name"),
            phone: z.string().describe("Customer's phone number"),
            email: z.string().describe("Customer's email address"),
            city: z.string().describe("Customer's city or area"),
            preferredTime: z
              .string()
              .describe("Preferred time to be contacted"),
            pestType: z.string().describe("Type of pest identified"),
            location: z.string().describe("Location of the pest problem"),
            frequency: z.string().describe("How often the pests are seen"),
            duration: z
              .string()
              .describe("How long the problem has been happening"),
            signs: z.string().describe("Signs of damage or smell"),
            severity: z
              .string()
              .describe("Severity assessment (Low/Moderate/High/Severe)"),
            previousAttempts: z
              .string()
              .describe("What the customer has tried to fix the problem"),
          }),
          execute: async (args) => {
            console.log("[v0] Saving assessment data:", args);

            try {
              const response = await fetch(`${baseUrl}/api/save-to-sheets`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(args),
              });

              const result = await response.json();
              console.log("[v0] Save result:", result);

              return { success: true, message: "Data saved successfully" };
            } catch (error) {
              console.error("[v0] Error saving to sheets:", error);
              return { success: false, message: "Failed to save data" };
            }
          },
        }),
      },
    });

    return NextResponse.json({
      response:
        text ||
        "I'm here to help! Could you tell me more about the pest issue you're experiencing?",
      shouldSaveToSheets: false,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        response:
          "I apologize, but I'm having trouble responding right now. Please try again or continue with your assessment.",
      },
      { status: 500 }
    );
  }
}
