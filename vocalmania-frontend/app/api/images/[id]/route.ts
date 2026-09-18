import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  const { id: fileId } = await params;

  if (!fileId) {
    return NextResponse.json({ error: "Keine Datei-ID angegeben" }, { status: 400 });
  }

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Metadaten abrufen, um den Mime-Type (z.B. image/jpeg) herauszufinden
    const metaRes = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
    });

    const mimeType = metaRes.data.mimeType || 'image/jpeg';

    // Das Bild im Binärformat aus Google Drive streamen
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400', // 1 Tag cachen für maximale Performance
      },
    });

  } catch (error) {
    console.error("Fehler beim Laden des Bildes aus Google Drive:", error);
    return NextResponse.json({ error: "Bild konnte nicht geladen werden" }, { status: 500 });
  }
}