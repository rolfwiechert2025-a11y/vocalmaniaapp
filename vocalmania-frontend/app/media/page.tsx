import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleauth';

interface MediaItem {
  titel: string;
  youtubeUrl: string;
  vorschaubild: string | null;
  beschreibung: string;
}

// Funktion zum Auslesen des Media/YouTube-Google-Docs (zeilenbasiert & 100% robust)
export async function fetchMediaFromDoc(fileId: string): Promise<MediaItem[]> {
  if (!fileId) return [];

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });

    const rawText = typeof response.data === 'string' ? response.data : '';
    
    // Wir teilen das Dokument sauber an jedem [Media] oder [Video] Tag auf
    const blocks = rawText.split(/(?=\[Media\]|\[Video\])/i).filter(b => b.includes('Titel:'));

    return blocks.map(block => {
      const getField = (field: string) => {
        const regex = new RegExp(`${field}:\\s*(.+)`, 'i');
        const match = block.match(regex);
        return match ? match[1].trim() : '';
      };

      const rawImage = getField('Vorschaubild');
      let vorschaubild: string | null = null;
      const fileIdMatch = rawImage.match(/(?:\/file\/d\/|\/open\?id=|\/document\/d\/|\/d\/|d\/)([a-zA-Z0-9_-]{25,})/);
      if (fileIdMatch && fileIdMatch[1]) {
        vorschaubild = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
      } else if (rawImage.startsWith('http')) {
        vorschaubild = rawImage;
      }

      const youtubeUrl = getField('Link') || getField('YouTube') || '#';

      return {
        titel: getField('Titel') || 'Tonbeitrag / Video',
        youtubeUrl,
        vorschaubild,
        beschreibung: getField('Beschreibung'),
      };
    });
  } catch (error) {
    console.error(`Fehler beim Laden des Media-Docs (${fileId}):`, error);
    return [];
  }
}

// Hilfsfunktion um YouTube-URLs in Einbettungs-URLs umzuwandeln
function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default async function MediaPage() {
  const mediaItems = await fetchMediaFromDoc(process.env.PUBLIC_MEDIA_DOC_ID || "");

  return (
    <div className="space-y-6">
      
      {/* SEITEN-HEADER (Im cleanen AppShell-Design ohne Hero-Bild) */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Mediathek</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Erlebe unsere Tonbeiträge und Videos im direkten Player</p>
        </div>
        <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
          {mediaItems.length} {mediaItems.length === 1 ? "Beitrag" : "Beiträge"}
        </span>
      </div>

      {/* MEDIEN-LISTE */}
      {mediaItems.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
          Aktuell sind keine Tonbeiträge oder Videos im Google Doc hinterlegt.
        </div>
      ) : (
        <div className="grid gap-5">
          {mediaItems.map((item, index) => {
            const embedUrl = getYouTubeEmbedUrl(item.youtubeUrl);

            return (
              <div key={index} className="bg-black/30 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">YouTube Beitrag</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{item.titel}</h2>
                </div>

                {/* YouTube Video Player oder Vorschaubild */}
                {embedUrl ? (
                  <div className="relative w-full aspect-video bg-black/50 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe 
                      src={embedUrl} 
                      title={item.titel}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  item.vorschaubild && (
                    <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                      <img 
                        src={item.vorschaubild} 
                        alt={item.titel} 
                        className="w-full h-full object-cover opacity-90"
                      />
                    </div>
                  )
                )}

                {/* Beschreibung */}
                {item.beschreibung && (
                  <p className="text-xs text-indigo-100/90 leading-relaxed whitespace-pre-line">
                    {item.beschreibung}
                  </p>
                )}

                {/* Externer Link Fallback */}
                <div className="pt-1">
                  <a 
                    href={item.youtubeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md transition-colors"
                  >
                    <span>▶️</span> Auf YouTube ansehen
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}