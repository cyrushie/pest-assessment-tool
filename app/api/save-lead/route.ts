import { type NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function POST(request: NextRequest) {
  try {
    const { name, email, consent, timestamp } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

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

    let leadsSheet = doc.sheetsByTitle["Leads"];
    if (!leadsSheet) {
      leadsSheet = await doc.addSheet({
        title: "Leads",
        headerValues: ["Timestamp", "Name", "Email", "Consent", "Status"],
      });
    }

    await leadsSheet.addRow({
      Timestamp: timestamp,
      Name: name,
      Email: email,
      Consent: consent ? "Yes" : "No",
      Status: "New Lead",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json(
      { error: "Failed to save lead data" },
      { status: 500 }
    );
  }
}
