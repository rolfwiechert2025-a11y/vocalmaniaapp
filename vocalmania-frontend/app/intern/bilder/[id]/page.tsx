import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";
import AlbumViewClient from "./AlbumViewClient";

// Verhindert Next.js Caching-Probleme auf Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InternalAlbumDetailPage({ params }: PageProps) {
  const { id: folderId } = await params;

  let albumTitle = "Internes Fotoalbum";
  let images: { id: string; name: string; imageUrl: string }[] = [];

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ordner-Namen für den Header abrufen
    const folderRes = await drive.files.get({
      fileId: folderId,
      fields: 'name',
    });
    albumTitle = folderRes.data.name || "Internes Fotoalbum";

    // 2. Alle Bilddateien in diesem Ordner abrufen
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp') and trashed = false`,
      fields: 'files(id, name)',
      orderBy: 'name',
    });

    images = (filesRes.data.files || []).map(file => ({
      id: file.id || '',
      name: file.name || 'Bild',
      imageUrl: `/api/images/${file.id}`,
    }));

  } catch (error) {
    console.error("Fehler beim Laden des internen Album-Inhalts:", error);
  }

  return (
    <AlbumViewClient 
      albumTitle={albumTitle} 
      images={images} 
      backUrl="/intern/bilder" 
    />
  );
}