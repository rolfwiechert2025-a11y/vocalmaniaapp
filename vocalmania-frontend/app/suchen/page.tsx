import Link from "next/link";
import Image from "next/image";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";
import { getPublicEvents } from "@/lib/events";
import { fetchMediaFromDoc } from "@/app/media/page";

interface SearchProps {
  searchParams?: Promise<{ q?: string }>;
}

interface DriveAlbum {
  id?: string | null;
  name?: string | null;
  description?: string | null;
}

interface MediaEntry {
  titel: string;
  beschreibung?: string;
  youtubeUrl?: string;
  vorschaubild?: string | null;
}

// Hilfsfunktion für YouTube/Drive-Thumbnails
function getThumbnail(url?: string, vorschaubild?: string | null): string | null {
  if (vorschaubild) return vorschaubild;
  if (!url) return null;
  
  const fileIdMatch = url.match(/(?:\/file\/d\/|\/open\?id=|\/document\/d\/|\/d\/|d\/)([a-zA-Z0-9_-]{25,})/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` 
    : null;
}

export default async function SearchResultsPage({ searchParams }: SearchProps) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q || "").trim().toLowerCase();

  if (!query) {
    return (
      <div className="text-center py-20 space-y-4">
        <h1 className="text-2xl font-bold text-white">Globale Suche</h1>
        <p className="text-sm text-indigo-200/70">Bitte gib oben im Suchfeld einen Begriff ein, um den Chor zu durchsuchen.</p>
      </div>
    );
  }

  // 1. Daten aus allen Quellen parallel laden mit korrekten Typen
  let albums: DriveAlbum[] = [];
  let concerts: Awaited<ReturnType<typeof getPublicEvents>> = [];
  let mediaItems: MediaEntry[] = [];

  try {
    const rootFolderId = process.env.PUBLIC_PICTURES_ROOT_ID;
    if (rootFolderId) {
      const auth = getGoogleAuth();
      const drive = google.drive({ version: 'v3', auth });
      const foldersRes = await drive.files.list({
        q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, description)',
        pageSize: 50,
      });
      albums = foldersRes.data.files || [];
    }
  } catch (e) {
    console.error("Fehler beim Laden der Alben für Suche:", e);
  }

  try {
    concerts = await getPublicEvents();
  } catch (e) {
    console.error("Fehler beim Laden der Konzerte für Suche:", e);
  }

  try {
    mediaItems = await fetchMediaFromDoc(process.env.PUBLIC_MEDIA_DOC_ID || "");
  } catch (e) {
    console.error("Fehler beim Laden der Medien für Suche:", e);
  }

  // 2. Filter-Logik über alle Bereiche anwenden
  const matchedAlbums = albums.filter(a => 
    (a.name && a.name.toLowerCase().includes(query)) || 
    (a.description && a.description.toLowerCase().includes(query)) ||
    query.includes("bild") || query.includes("foto") || query.includes("album")
  );

  const matchedConcerts = concerts.filter(c => {
    const title = (c.summary || "").toLowerCase();
    const loc = (c.resolvedLocation || "").toLowerCase();
    const desc = (c.resolvedShortDesc || "").toLowerCase();
    return title.includes(query) || loc.includes(query) || desc.includes(query) ||
           query.includes("termin") || query.includes("konzert") || query.includes("auftritt");
  });

  const matchedMedia = mediaItems.filter(m => 
    (m.titel && m.titel.toLowerCase().includes(query)) || 
    (m.beschreibung && m.beschreibung.toLowerCase().includes(query)) ||
    query.includes("media") || query.includes("musik") || query.includes("video") || query.includes("lied")
  );

  const totalResults = matchedAlbums.length + matchedConcerts.length + matchedMedia.length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Such-Header */}
      <div className="bg-black/30 backdrop-blur-md border border-white/15 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Suchergebnisse</span>
        <h1 className="text-2xl md:text-3xl font-black text-white">
          Ergebnisse für „{resolvedParams?.q}“
        </h1>
        <p className="text-xs text-indigo-200/70">
          {totalResults === 0 ? "Keine Treffer gefunden." : `${totalResults} passende Einträge im Chor-Archiv gefunden.`}
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-16 bg-black/20 rounded-3xl border border-white/10 p-8 space-y-3">
          <p className="text-white font-bold">Leider nichts gefunden</p>
          <p className="text-xs text-indigo-200/60 max-w-sm mx-auto">
            Versuche es mit einem anderen Suchbegriff oder schaue direkt in den Bereichen Konzerte, Bilder oder Media nach.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link href="/konzerte" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors">
              Zu den Konzerten
            </Link>
            <Link href="/bilder" className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors">
              Zu den Bildern
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* KONZERTE & TERMINE */}
          {matchedConcerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <span>📅</span> Konzerte & Termine ({matchedConcerts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedConcerts.map((event, idx) => {
                  const startDate = new Date(event.start?.dateTime || event.start?.date || "");
                  const formattedDate = !isNaN(startDate.getTime()) 
                    ? startDate.toLocaleDateString("de-DE", { day: '2-digit', month: 'short', year: 'numeric' })
                    : "Demnächst";

                  return (
                    <Link key={event.id || idx} href="/konzerte" className="bg-black/30 hover:bg-black/50 border border-white/10 rounded-2xl p-4 transition-all flex flex-col justify-between group">
                      <div>
                        <span className="text-[10px] bg-indigo-600/60 text-white px-2.5 py-0.5 rounded-full font-semibold">
                          {formattedDate}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                          {event.summary || "Konzert"}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {event.resolvedShortDesc || event.resolvedLocation || "Keine Details"}
                        </p>
                      </div>
                      <span className="text-[11px] text-indigo-400 font-medium mt-4 inline-flex items-center gap-1">
                        Details ansehen →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* FOTOALBEN */}
          {matchedAlbums.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <span>🖼️</span> Fotoalben ({matchedAlbums.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedAlbums.map((album, idx) => (
                  <Link key={album.id || idx} href={`/bilder/${album.id}`} className="bg-black/30 hover:bg-black/50 border border-white/10 rounded-2xl p-4 transition-all flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-xl bg-indigo-950 flex items-center justify-center text-2xl shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                      📁
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {album.name}
                      </h3>
                      <p className="text-xs text-slate-300 truncate mt-0.5">
                        {album.description || "Fotoalbum"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA & VIDEOS */}
          {matchedMedia.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <span>🎵</span> Audio & Video ({matchedMedia.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedMedia.map((item, idx) => {
                  const thumb = getThumbnail(item.youtubeUrl, item.vorschaubild);
                  return (
                    <a key={idx} href={item.youtubeUrl || "/media"} target="_blank" rel="noopener noreferrer" className="bg-black/30 hover:bg-black/50 border border-white/10 rounded-2xl p-4 transition-all flex items-center gap-4 group">
                      {thumb ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                          <Image src={thumb} alt={item.titel} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-indigo-950 flex items-center justify-center text-xl shrink-0 border border-white/10">
                          🎵
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {item.titel}
                        </h3>
                        <p className="text-xs text-slate-300 truncate mt-0.5">
                          {item.beschreibung || "YouTube Beitrag"}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}