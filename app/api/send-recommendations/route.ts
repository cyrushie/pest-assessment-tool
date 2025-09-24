import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const pestRecommendations: { [key: string]: { [key: string]: string[] } } = {
  "Ants (Carpenter, Argentine, Odorous, etc.)": {
    Moderate: [
      "Seal Entry Points: Seal cracks, gaps, and crevices around windows, doors, and walls where ants are entering.",
      "Use Ant Baits: Place ant bait or gel in areas where ants are most active (e.g., kitchen, bathroom). The ants will carry the bait back to the nest.",
    ],
    High: [
      "Seal Entry Points: Seal cracks, gaps, and crevices around windows, doors, and walls where ants are entering.",
      "Use Ant Baits: Place ant bait or gel in areas where ants are most active (e.g., kitchen, bathroom). The ants will carry the bait back to the nest.",
      "Professional Treatment: Consider professional ant control for persistent infestations.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe ant infestations.",
      "Structural Inspection: Have your property inspected for structural damage, especially with carpenter ants.",
    ],
  },
  Spiders: {
    Moderate: [
      "Vacuum Webs Regularly: Regularly vacuum spider webs, especially in corners, ceilings, and other hidden areas.",
      "Remove Clutter: Clear clutter in dark areas (e.g., closets, basements), as spiders often nest in undisturbed places.",
    ],
    High: [
      "Vacuum Webs Regularly: Regularly vacuum spider webs, especially in corners, ceilings, and other hidden areas.",
      "Remove Clutter: Clear clutter in dark areas (e.g., closets, basements), as spiders often nest in undisturbed places.",
      "Seal Entry Points: Seal cracks and gaps where spiders may enter your home.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe spider infestations.",
      "Species Identification: Have spiders identified to determine if they are dangerous species.",
    ],
  },
  "Cockroaches (German, Oriental, American, Turkish)": {
    Moderate: [
      "Clean Regularly: Cockroaches are attracted to food and grease, so clean kitchen counters, floors, and under appliances daily.",
      "Set Traps: Use cockroach traps or gel bait in areas where you've seen activity.",
      "Fix Leaks: Cockroaches are attracted to moisture, so fix any leaks in pipes or faucets.",
    ],
    High: [
      "Clean Regularly: Cockroaches are attracted to food and grease, so clean kitchen counters, floors, and under appliances daily.",
      "Set Traps: Use cockroach traps or gel bait in areas where you've seen activity.",
      "Fix Leaks: Cockroaches are attracted to moisture, so fix any leaks in pipes or faucets.",
      "Professional Baiting: Consider professional-grade baiting systems for persistent problems.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe cockroach infestations.",
      "Health Risk Assessment: Cockroaches can spread diseases - immediate action required.",
    ],
  },
  "Rodents (Rats, Mice)": {
    Moderate: [
      "Seal Entry Points: Use steel wool or caulk to seal cracks around windows, doors, and foundation, where rodents can enter.",
      "Set Traps: Use snap traps, live traps, or bait stations along walls and pathways where rodents travel.",
      "Remove Food Sources: Store food in sealed containers, and clean up crumbs or spills immediately.",
      "Remove Clutter: Clear clutter in attics, basements, and under furniture where rodents can nest.",
    ],
    High: [
      "Seal Entry Points: Use steel wool or caulk to seal cracks around windows, doors, and foundation, where rodents can enter.",
      "Set Traps: Use snap traps, live traps, or bait stations along walls and pathways where rodents travel.",
      "Remove Food Sources: Store food in sealed containers, and clean up crumbs or spills immediately.",
      "Remove Clutter: Clear clutter in attics, basements, and under furniture where rodents can nest.",
      "Professional Baiting: Consider professional rodent control programs.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe rodent infestations.",
      "Health and Safety Assessment: Rodents can spread diseases and cause structural damage - immediate action required.",
    ],
  },
  Earwigs: {
    Moderate: [
      "Reduce Moisture: Earwigs are attracted to moisture, so fix any leaks in bathrooms, kitchens, or basements.",
      "Remove Hiding Spots: Clear leaves, mulch, and other debris around the foundation of your home where earwigs may hide.",
    ],
    High: [
      "Reduce Moisture: Earwigs are attracted to moisture, so fix any leaks in bathrooms, kitchens, or basements.",
      "Remove Hiding Spots: Clear leaves, mulch, and other debris around the foundation of your home where earwigs may hide.",
      "Perimeter Treatment: Apply diatomaceous earth around entry points.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe earwig infestations.",
    ],
  },
  Silverfish: {
    Moderate: [
      "Reduce Humidity: Use a dehumidifier in damp areas (bathrooms, basements) to lower humidity, which attracts silverfish.",
      "Store Food Properly: Store dry foods like grains and flour in airtight containers.",
    ],
    High: [
      "Reduce Humidity: Use a dehumidifier in damp areas (bathrooms, basements) to lower humidity, which attracts silverfish.",
      "Store Food Properly: Store dry foods like grains and flour in airtight containers.",
      "Seal Cracks: Seal cracks and crevices where silverfish may hide.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe silverfish infestations.",
    ],
  },
  "Beetles (Carpet, Weevils, etc.)": {
    Moderate: [
      "Vacuum Regularly: Vacuum carpets, floors, furniture, and other places where beetles may be hiding or laying eggs.",
      "Store Dry Goods Properly: If dealing with weevils or other food pests, store dry food in airtight containers.",
      "Wash Fabric Items: Wash blankets, curtains, and rugs in hot water to kill larvae and eggs.",
    ],
    High: [
      "Vacuum Regularly: Vacuum carpets, floors, furniture, and other places where beetles may be hiding or laying eggs.",
      "Store Dry Goods Properly: If dealing with weevils or other food pests, store dry food in airtight containers.",
      "Wash Fabric Items: Wash blankets, curtains, and rugs in hot water to kill larvae and eggs.",
      "Professional Treatment: Consider professional beetle control for persistent infestations.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe beetle infestations.",
    ],
  },
  "Stored Food Pests (e.g., Indian Meal Moths)": {
    Moderate: [
      "Inspect and Discard Infested Food: Check all food products in your pantry, especially grains and dried fruits, for signs of infestation. Discard any infested items.",
      "Store Food Properly: Store all dry food products in airtight containers to prevent pests from accessing them.",
      "Vacuum and Clean: Vacuum pantry shelves and surrounding areas to remove larvae, eggs, and webs.",
    ],
    High: [
      "Inspect and Discard Infested Food: Check all food products in your pantry, especially grains and dried fruits, for signs of infestation. Discard any infested items.",
      "Store Food Properly: Store all dry food products in airtight containers to prevent pests from accessing them.",
      "Vacuum and Clean: Vacuum pantry shelves and surrounding areas to remove larvae, eggs, and webs.",
      "Pheromone Traps: Use pheromone traps to monitor and control adult moths.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe stored food pest infestations.",
      "Complete Pantry Overhaul: May require complete cleaning and replacement of all stored food items.",
    ],
  },
  Gophers: {
    Moderate: [
      "Set Traps: Use gopher traps in active tunnels or burrows.",
      "Create Barriers: Install underground barriers (e.g., wire mesh) to prevent gophers from digging under fences or gardens.",
    ],
    High: [
      "Set Traps: Use gopher traps in active tunnels or burrows.",
      "Create Barriers: Install underground barriers (e.g., wire mesh) to prevent gophers from digging under fences or gardens.",
      "Professional Baiting: Consider professional gopher control programs.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe gopher infestations.",
    ],
  },
  Moles: {
    Moderate: [
      "Set Traps: Use mole traps in active tunnels or burrows.",
      "Create Barriers: Install underground barriers to prevent moles from accessing certain areas.",
    ],
    High: [
      "Set Traps: Use mole traps in active tunnels or burrows.",
      "Create Barriers: Install underground barriers to prevent moles from accessing certain areas.",
      "Professional Treatment: Consider professional mole control for extensive damage.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe mole infestations.",
    ],
  },
  Bees: {
    Moderate: [
      "For your safety and the safety of others, we recommend contacting a professional for bee removal.",
      "Do not attempt to remove bee hives yourself.",
    ],
    High: [
      "For your safety and the safety of others, we recommend contacting a professional for bee removal immediately.",
      "Avoid the area where bees are active.",
    ],
    Severe: [
      "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for bee removal.",
      "Do not approach bee hives or swarms - serious safety risk.",
    ],
  },
  Wasps: {
    Moderate: [
      "For your safety and the safety of others, we recommend contacting a professional for wasp removal.",
      "Do not attempt to remove wasp nests yourself.",
    ],
    High: [
      "For your safety and the safety of others, we recommend contacting a professional for wasp removal immediately.",
      "Avoid the area where wasps are active.",
    ],
    Severe: [
      "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for wasp removal.",
      "Do not approach wasp nests - serious safety risk.",
    ],
  },
  "Yellow Jackets": {
    Moderate: [
      "For your safety and the safety of others, we recommend contacting a professional for yellow jacket removal.",
      "Do not attempt to remove yellow jacket nests yourself.",
    ],
    High: [
      "For your safety and the safety of others, we recommend contacting a professional for yellow jacket removal immediately.",
      "Avoid the area where yellow jackets are active.",
    ],
    Severe: [
      "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for yellow jacket removal.",
      "Do not approach yellow jacket nests - serious safety risk.",
    ],
  },
};

interface PestRecommendation {
  pest: string;
  severity: string;
  recommendations: string[];
}

function calculateSeverity(selectedPest: string, answers: any): string {
  // This is a simplified version - you may want to import the actual function
  const severityScore = Object.values(answers).reduce(
    (score: number, answer: any) => {
      if (typeof answer === "string") {
        if (
          answer.includes("hundreds") ||
          answer.includes("daily") ||
          answer.includes("every_night") ||
          answer.includes("multiple_places") ||
          answer.includes("often") ||
          answer.includes("several_large") ||
          answer.includes("yes_damage") ||
          answer.includes("yes_sacs") ||
          answer.includes("multiple") ||
          answer.includes("frequently") ||
          (answer === "yes" && Math.random() > 0.5)
        ) {
          return score + 3;
        } else if (
          answer.includes("few") ||
          answer.includes("occasionally") ||
          answer.includes("one_area") ||
          answer.includes("few_small") ||
          answer.includes("one_two") ||
          answer.includes("weekly")
        ) {
          return score + 2;
        } else {
          return score + 1;
        }
      }
      return score;
    },
    0
  );

  const maxPossibleScore = Object.keys(answers).length * 3;
  const severityPercentage = (severityScore / maxPossibleScore) * 100;

  if (severityPercentage >= 70) return "Severe";
  if (severityPercentage >= 40) return "High";
  return "Moderate";
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      primaryPest,
      otherPests = [],
      answers,
      activityLevel,
    } = await request.json();

    if (!email || !name || !primaryPest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get recommendations for primary pest
    const primaryRecommendations =
      pestRecommendations[primaryPest]?.[activityLevel] || [];

    const otherPestRecommendations: PestRecommendation[] = otherPests.map(
      (pest: string) => {
        // Use moderate severity as default for other pests since we didn't assess them specifically
        return {
          pest,
          severity: "Moderate", // This won't be displayed but kept for interface compatibility
          recommendations: pestRecommendations[pest]?.["Moderate"] || [],
        };
      }
    );

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Pest Assessment Results</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .primary-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
            .other-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #6b7280; }
            .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
            .severe { background: #fee2e2; color: #dc2626; }
            .high { background: #fed7aa; color: #ea580c; }
            .moderate { background: #fef3c7; color: #d97706; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .cta { background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🐛 Your Pest Assessment Results</h1>
            <p>Professional recommendations for ${name}</p>
          </div>
          
          <div class="content">
            <div class="primary-section">
              <h2>🎯 PRIMARY PEST (Your Main Concern)</h2>
              <h3>${primaryPest}</h3>
              <span class="severity-badge ${activityLevel.toLowerCase()}">${activityLevel.toUpperCase()} SEVERITY</span>
              
              <h4>Recommended Actions:</h4>
              <ul>
                ${primaryRecommendations
                  .map((rec: string) => `<li>${rec}</li>`)
                  .join("")}
              </ul>
            </div>

            ${
              otherPestRecommendations.length > 0
                ? `
              <div class="other-section">
                <h2>📋 OTHER PESTS YOU SELECTED</h2>
                ${otherPestRecommendations
                  .map(
                    ({ pest, recommendations }: PestRecommendation) => `
                  <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <h4>${pest}</h4>
                    <ul>
                      ${recommendations
                        .map((rec: string) => `<li>${rec}</li>`)
                        .join("")}
                    </ul>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pest-assessment-tool.vercel.app/" class="cta">📞 GET FREE PROFESSIONAL CONSULTATION</a>
              <p><strong>Don't let pests take over your home!</strong></p>
              <p>Our certified professionals are ready to help you solve your pest problems quickly and effectively.</p>
            </div>
          </div>

          <div class="footer">
            <p>This assessment was generated based on your responses. For immediate assistance, contact our pest control experts.</p>
            <p><strong>Remember:</strong> Early intervention saves time, money, and prevents bigger problems!</p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Pest Assessment <onboarding@resend.dev>",
      to: [email],
      subject: `🐛 Your ${activityLevel} Pest Assessment Results - ${primaryPest}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Recommendations sent successfully",
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send recommendations email" },
      { status: 500 }
    );
  }
}
