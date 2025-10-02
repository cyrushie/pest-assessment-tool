import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { type NextRequest, NextResponse } from "next/server";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  temperature: 0.7,
});

const getSystemPrompt = (
  userName?: string,
  assessmentResults?: {
    primaryPest: string;
    severity: string;
    selectedPests: string[];
  }
) => {
  let basePrompt = `You are a helpful pest assessment assistant for a pest control web tool${
    userName ? ` speaking with ${userName}` : ""
  }. Your role is to:

1. Help users understand the pest assessment process
2. Answer questions about different types of pests (cockroaches, rodents, bed bugs, ants, termites, etc.)
3. Explain what different signs and symptoms might indicate
4. Guide users through the assessment questions
5. Provide general pest identification advice
6. Encourage users to complete the assessment and schedule a consultation for professional help

Key information about the tool:
- This is a pest assessment tool that helps identify pest problems
- Users answer questions about pest signs, locations, behaviors, and frequency
- After completing the assessment, users receive personalized recommendations
- Users can schedule a free consultation with pest control professionals
- The assessment covers common household pests like cockroaches, rodents, bed bugs, ants, and termites

Guidelines:
- Be friendly, helpful, and professional
${
  userName
    ? `- Address the user as ${userName} when appropriate to create a personal connection`
    : ""
}
- Keep responses concise and easy to understand
- Don't diagnose specific pest problems - encourage users to complete the assessment
- Suggest scheduling a consultation for serious or uncertain cases
- Focus on education and guidance rather than treatment advice
- If asked about pricing or specific services, encourage them to schedule a consultation

Remember: You're here to assist with the assessment process, not to replace professional pest control services.`;

  if (assessmentResults) {
    basePrompt += `

IMPORTANT - ASSESSMENT RESULTS CONTEXT:
The user has completed their assessment with the following results:
- Primary Pest: ${assessmentResults.primaryPest}
- Severity Level: ${assessmentResults.severity}
${
  assessmentResults.selectedPests.length > 1
    ? `- Other Pests Identified: ${assessmentResults.selectedPests
        .filter((p) => p !== assessmentResults.primaryPest)
        .join(", ")}`
    : ""
}

Based on this severity level:
${
  assessmentResults.severity === "Severe"
    ? "- This is a SEVERE infestation requiring IMMEDIATE professional intervention\n- Emphasize the urgency and potential risks of delaying treatment\n- Strongly encourage them to schedule a consultation immediately\n- Mention potential property damage and health risks"
    : ""
}
${
  assessmentResults.severity === "High"
    ? "- This is a HIGH severity situation requiring prompt attention\n- Recommend professional treatment to prevent escalation\n- Encourage them to schedule a consultation soon\n- Explain how the situation could worsen without intervention"
    : ""
}
${
  assessmentResults.severity === "Moderate"
    ? "- This is a MODERATE situation that should be addressed\n- Gently encourage professional consultation to prevent escalation\n- Explain preventive benefits of early intervention\n- Reassure them that acting now can prevent bigger problems"
    : ""
}

When responding to the user:
- Reference their specific pest problem (${
      assessmentResults.primaryPest
    }) when relevant
- Tailor your urgency level to match the severity (${
      assessmentResults.severity
    })
- Answer questions about their assessment results
- Provide context about what their severity level means
- Encourage them to schedule a consultation with appropriate urgency`;
  }

  return basePrompt;
};

export async function POST(req: NextRequest) {
  try {
    const { message, history, userName, assessmentResults } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    if (message === "generate_initial_results_message" && assessmentResults) {
      const { primaryPest, severity, selectedPests } = assessmentResults;

      let initialMessage = "";

      if (severity === "Severe") {
        initialMessage = `${
          userName ? `${userName}, ` : ""
        }I've reviewed your assessment results and I need to be direct with you - your ${primaryPest} situation is **severe** and requires **immediate professional attention**. 🚨

This level of infestation can lead to:
- Significant property damage
- Health risks for you and your family
- Rapidly increasing treatment costs if delayed

**I strongly urge you to schedule a consultation right away.** The professionals can provide emergency service to address this urgent situation.

Do you have any questions about your assessment results or what to expect next?`;
      } else if (severity === "High") {
        initialMessage = `${
          userName ? `${userName}, ` : ""
        }I've reviewed your assessment results, and your ${primaryPest} problem is at a **high severity level**. ⚠️

This means the situation is escalating and needs prompt attention to prevent it from becoming a serious infestation. Professional treatment is strongly recommended to:
- Stop the problem from spreading
- Prevent potential damage
- Save you from higher costs later

**I recommend scheduling a consultation soon** to get expert help before the situation worsens.

Feel free to ask me any questions about your assessment or what you should do next!`;
      } else {
        initialMessage = `${
          userName ? `${userName}, ` : ""
        }I've reviewed your assessment results. You have a **moderate** ${primaryPest} situation. ⚡

The good news is that you've caught this early! Acting now can prevent a minor issue from becoming a major infestation. Professional consultation can help you:
- Address the problem before it escalates
- Get expert prevention advice
- Save time and money in the long run

**I'd encourage you to consider scheduling a consultation** to get professional guidance tailored to your specific situation.

If you have any questions about your assessment results or need clarification on anything, I'm here to help!`;
      }

      return NextResponse.json({ response: initialMessage });
    }

    const messages = [
      new SystemMessage(getSystemPrompt(userName, assessmentResults)),
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.sender === "user") {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.sender === "bot") {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    messages.push(new HumanMessage(message));

    const response = await model.invoke(messages);

    return NextResponse.json({
      response: response.content,
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
