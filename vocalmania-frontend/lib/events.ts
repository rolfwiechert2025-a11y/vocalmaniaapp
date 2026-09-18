import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleauth';

export interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  };
  location?: string | null;
}

export interface ParsedEventData {
  shortDesc: string;
  longDesc: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  customLocation: string | null;
}

export interface ProcessedConcertEvent extends CalendarEvent {
  resolvedShortDesc: string;
  resolvedLongDesc: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  resolvedLocation: string | null;
}

async function fetchGoogleDocContent(fileId: string): Promise<ParsedEventData> {
  const defaultData: ParsedEventData = {
    shortDesc: '',
    longDesc: '',
    imageUrl: null,
    ticketUrl: null,
    customLocation: null,
  };

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });

    let rawText = typeof response.data === 'string' ? response.data : '';
    rawText = rawText.replace(/<[^>]*>?/gm, '');

    function extractSection(tag: string): string {
      const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\s*\\[[a-zA-ZäöüÄÖÜß]+\\]|$)`, 'i');
      const match = rawText.match(regex);
      return match ? match[1].trim() : '';
    }

    const shortDesc = extractSection('Kurzbeschreibung');
    const longDesc = extractSection('Beschreibung');
    const rawImage = extractSection('Bild');
    const ticketUrl = extractSection('Ticketlink') || null;
    const customLocation = extractSection('Ort') || null;

    let imageUrl: string | null = null;
    const fileIdMatch = rawImage.match(/(?:\/file\/d\/|\/open\?id=|\/document\/d\/|\/d\/|d\/)([a-zA-Z0-9_-]{25,})/);
    if (fileIdMatch && fileIdMatch[1]) {
      imageUrl = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }

    return {
      shortDesc,
      longDesc,
      imageUrl,
      ticketUrl,
      customLocation,
    };
  } catch (error) {
    console.error(`Fehler beim Laden des Google Docs (${fileId}):`, error);
    return defaultData;
  }
}

export async function getPublicEvents(): Promise<ProcessedConcertEvent[]> {
  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: process.env.PUBLIC_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const processedEvents = await Promise.all(
      events.map(async (event) => {
        const rawDescription = event.description || "";
        
        let docData: ParsedEventData = {
          shortDesc: '',
          longDesc: '',
          imageUrl: null,
          ticketUrl: null,
          customLocation: null,
        };

        const docMatch = rawDescription.match(/(?:docs\.google\.com\/document\/d\/|\/document\/d\/)([a-zA-Z0-9_-]+)/);
        if (docMatch && docMatch[1]) {
          docData = await fetchGoogleDocContent(docMatch[1]);
        } else {
          docData.shortDesc = rawDescription.replace(/<[^>]*>?/gm, '').trim();
        }

        const finalLocation = docData.customLocation || event.location || null;

        return {
          ...event,
          resolvedShortDesc: docData.shortDesc,
          resolvedLongDesc: docData.longDesc,
          imageUrl: docData.imageUrl,
          ticketUrl: docData.ticketUrl,
          resolvedLocation: finalLocation,
        };
      })
    );

    return processedEvents;
  } catch (error) {
    console.error('Fehler beim Laden des Kalenders:', error);
    return [];
  }
}