import Link from "next/link";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";

interface AlbumItem {
  id: string;
  titel: string;
  link: string;
  vorschaubild: string | null;
  beschreibung: string;
  bildAnzahl: number;
}

// Funktion zum Auslesen der Alben direkt aus der Google Drive Ordnerstruktur
async function fetchAlbumsFromDrive(): Promise<AlbumItem[]> {
  const rootFolderId = process.env.PUBLIC_PICTURES_ROOT_ID;
  if (!rootFolderId) {
    console.error("PUBLIC_PICTURES_ROOT_ID ist nicht in der .env definiert.");
    return [];
  }

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Alle Unterordner (Alben) im Root-Ordner abrufen
    const foldersRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, description, webViewLink)',
      orderBy: 'name desc',
    });

    const subFolders = foldersRes.data.files || [];

    // 2. Für jeden Unterordner die Bilder und Details parallel abrufen
    const albumPromises = subFolders.map(async (folder): Promise<AlbumItem | null> => {
      if (!folder.id || !folder.name) return null;

      // Bilder im Ordner suchen
      const filesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp') and trashed = false`,
        fields: 'files(id, name)',
        orderBy: 'name',
        pageSize: 10,
      });

      const images = filesRes.data.files || [];
      
      let vorschaubild: string | null = null;
      if (images.length > 0 && images[0].id) {
        vorschaubild = `/api/images/${images[0].id}`;
      }

      return {
        id: folder.id,
        titel: folder.name,
        link: `/bilder/${folder.id}`,
        vorschaubild,
        beschreibung: folder.description || `Fotoalbum mit ${images.length} Bildern`,
        bildAnzahl: images.length,
      };
    });

    const results = await Promise.all(albumPromises);

    // Filtert null-Werte heraus und garantiert TypeScript den Typ AlbumItem[]
    return results.filter((album): album is AlbumItem => album !== null);

  } catch (error) {
    console.error("Fehler beim Laden der Alben aus Google Drive:", error);
    return [];
  }
}

export default async function BilderPage() {
  const albums = await fetchAlbumsFromDrive();

  return (
    <div className="space-y-6">
      
      {/* SEITEN-HEADER (Ohne großes Hero-Bild, im cleanen AppShell-Stil) */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Bildergalerie</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Wähle ein Fotoalbum aus, um die Aufnahmen anzusehen</p>
        </div>
        <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
          {albums.length} {albums.length === 1 ? "Album" : "Alben"}
        </span>
      </div>

      {/* ALBUM-LISTE (Im einheitlichen Raster-Stil) */}
      {albums.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
          Aktuell sind keine Alben im Google Drive Verzeichnis hinterlegt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {albums.map((album) => (
            <Link 
              key={album.id} 
              href={album.link} 
              className="group bg-black/30 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-xl space-y-3 hover:border-indigo-400 hover:bg-black/40 transition-all block"
            >
              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  {album.bildAnzahl} {album.bildAnzahl === 1 ? "Bild" : "Bilder"}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5 group-hover:text-indigo-300 transition-colors">
                  {album.titel}
                </h2>
              </div>

              {/* Beschreibung */}
              {album.beschreibung && (
                <p className="text-xs text-indigo-100/80 leading-relaxed line-clamp-2">
                  {album.beschreibung}
                </p>
              )}

              {/* Vorschaubild */}
              <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                {album.vorschaubild ? (
                  <img 
                    src={album.vorschaubild} 
                    alt={album.titel} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-indigo-200/50 text-xs">
                    Kein Vorschaubild
                  </div>
                )}
              </div>

              {/* Action-Button */}
              <div className="pt-1">
                <span className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 group-hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md transition-colors">
                  📁 Album ansehen &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}