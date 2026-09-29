import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function GET() {
  try {
    const message = await client.messages.create({
      // Wichtig: Bei Templates nutzen wir contentSid statt body
      contentSid: process.env.TWILIO_CONTENT_SID,
      // Hier füllst du die Platzhalter {{1}}, {{2}}, {{3}} aus deinem Template:
      contentVariables: JSON.stringify({
        "1": "Julia",
        "2": "Mittwoch, den 01.10.2026",
        "4": "19:30 Uhr",
        "3": "Sopran 1"
      }),
      from: process.env.TWILIO_WHATSAPP_FROM, // z.B. whatsapp:+15553289545
      to: "whatsapp:+491729082424",         // Deine Zielnummer (z.B. deine private Handynummer)
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error) {
    console.error("Fehler beim WhatsApp-Template-Versand:", error);
    return NextResponse.json({ error: "Fehler beim Senden", details: String(error) }, { status: 500 });
  }
}