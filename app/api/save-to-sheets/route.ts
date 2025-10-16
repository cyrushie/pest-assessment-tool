import { type NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log("[v0] Received data to save:", data);

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID!,
      serviceAccountAuth
    );
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle["Assessment Data"];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: "Assessment Data",
        headerValues: [
          "Timestamp",
          "Name",
          "Email",
          "Phone",
          "City",
          "Preferred Contact Time",
          "Pest Type",
          "Location",
          "Frequency",
          "Duration",
          "Signs",
          "Severity",
          "Previous Attempts",
        ],
      });
    }

    const rowData = {
      Timestamp: new Date().toISOString(),
      Name: data.name || "",
      Email: data.email || "",
      Phone: data.phone || "",
      City: data.city || "",
      "Preferred Contact Time": data.preferredTime || "",
      "Pest Type": data.pestType || "",
      Location: data.location || "",
      Frequency: data.frequency || "",
      Duration: data.duration || "",
      Signs: data.signs || "",
      Severity: data.severity || "",
      "Previous Attempts": data.previousAttempts || "",
    };

    console.log("[v0] Saving row data:", rowData);

    await sheet.addRow(rowData);

    console.log("[v0] Successfully saved to Google Sheets");

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
