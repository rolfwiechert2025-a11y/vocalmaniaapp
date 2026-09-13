// Datei: src/lib/googleauth.ts
import { google } from 'googleapis';

export function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      // Das .replace sorgt dafür, dass Zeilenumbrüche im Private Key richtig verarbeitet werden
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',    // Für die Konzerte
      'https://www.googleapis.com/auth/drive.readonly',       // Für die Google Docs (Konzert-Details & Alben-Texte)
      'https://www.googleapis.com/auth/photoslibrary.readonly'// Für die Bilder/Alben
    ],
  });
}