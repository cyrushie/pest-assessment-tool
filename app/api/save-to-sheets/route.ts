import { type NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Initialize Google Sheets authentication
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      serviceAccountAuth
    );
    await doc.loadInfo();

    // Get or create the worksheet
    let sheet = doc.sheetsByIndex[0];

    if (!sheet) {
      sheet = await doc.addSheet({
        title: "Pest Assessment Contacts",
        headerValues: [
          "Timestamp",
          "Name",
          "Email",
          "Phone",
          "Preferred Time",
          "Notes",
          "Contact Type",
          "Identified Pest",
          "Activity Level",
          "Confidence",
          "Assessment Answers",
          "Uploaded Files",
          "Detailed Description",
        ],
      });
    }

    // Prepare the row data
    const rowData = {
      Timestamp: new Date().toISOString(),
      Name: data.name || "",
      Email: data.email || "",
      Phone: data.phone || "",
      "Preferred Time": data.preferredTime || "",
      Notes: data.notes || "",
      "Contact Type": data.contactType || "",
      "Identified Pest": data.pestInfo?.pest || "",
      "Activity Level": data.pestInfo?.activityLevel || "",
      Confidence: data.pestInfo?.confidence || "",
      "Assessment Answers": JSON.stringify(data.assessmentAnswers || {}),
      "Uploaded Files": JSON.stringify(data.uploadedFilesInfo || {}),
      "Detailed Description": data.detailedDescription || "",
    };

    // Add the row to the sheet
    await sheet.addRow(rowData);

    return NextResponse.json({
      success: true,
      message: "Contact information saved to Google Sheets successfully",
    });
  } catch (error) {
    console.error("Google Sheets integration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save to Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
