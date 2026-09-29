import { NextResponse } from "next/server";
import twilio from "twilio";
// import { db } from "@/lib/db"; // Dein Datenbank-Client

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function GET(request: Request) {
  // 1. Sicherheit: Prüfen, ob der Aufruf autorisiert ist (Cron Secret)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Nächste Probe & Mitglieder aus der Datenbank laden (Beispiel-Logik)
    // const upcomingRehearsal = await db.getClosestRehearsal();
    // const members = await db.getMembersWithMobileNumber();

    // Dummy-Daten für das Beispiel:
    const rehearsalDate = "Mittwoch, 01.10.2026";
    const rehearsalTime = "19:30 Uhr";
    const members = [
      { vorname: "Rolf", mobil_number: "+4915752429035", register: "Bass 1" },
      // ... weitere Mitglieder
    ];

    const results = [];

    // 3. Schleife über alle Mitglieder mit gültiger Mobilnummer
    for (const member of members) {
      if (!member.mobil_number) continue;

      try {
        const message = await client.messages.create({
          contentSid: process.env.TWILIO_CONTENT_SID,
          contentVariables: JSON.stringify({
            "1": member.vorname,
            "2": rehearsalDate,
            "4": rehearsalTime,
            "3": member.register
          }),
          from: process.env.TWILIO_WHATSAPP_FROM,
          to: `whatsapp:${member.mobil_number}`,
        });

        results.push({ to: member.mobil_number, success: true, sid: message.sid });
      } catch (err) {
        results.push({ to: member.mobil_number, success: false, error: String(err) });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ error: "Fehler beim Reminder-Lauf", details: String(error) }, { status: 500 });
  }
}