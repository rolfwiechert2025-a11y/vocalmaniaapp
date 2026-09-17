import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleauth';
import Image from 'next/image';

interface MediaItem {
  titel: string;
  youtubeUrl: string;
  vorschaubild: string | null;
  beschreibung: string;
}

// Funktion zum Auslesen des Media/YouTube-Google-Docs
async function fetchMediaFromDoc(fileId: string): Promise<MediaItem[]> {
  if (!fileId) return [];

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });

    const rawText = typeof response.data === 'string' ? response.data : '';
    
    // Einträge anhand des Tags [Media] oder [Video] auftrennen
    const blocks = rawText.split(/(?=\[(?:Media|Video)\])/i).filter(b => b.includes('[Media]') || b.includes('[Video]'));

    return blocks.map(block => {
      const getField = (field: string) => {
        const regex = new RegExp(`${field}:\\s*(.*)`, 'i');
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

// Hilfsfunktion um YouTube-URLs in Einbettungs-URLs oder Thumbnail-URLs umzuwandeln
function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default async function MediaPage() {
  const mediaItems = await fetchMediaFromDoc(process.env.PUBLIC_MEDIA_DOC_ID || "");

  return (
    <div className="space-y-0">
      
{/* 1. HERO-BEREICH (Erzwungene volle Bildschirmbreite) */}
      <div className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-72 md:h-96 bg-slate-900 -mt-6 md:-mt-10 mb-8 overflow-hidden">
        <Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Überschrift im Bild */}
        <div className="absolute bottom-6 left-0 right-0 z-10">
          <div className="max-w-5xl mx-auto px-6 md:px-10 space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white">
              Mediathek
            </h1>
            <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
              Tonbeiträge & Videos
            </p>
          </div>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH (Ohne abgerundete Ecken) */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-10 border-b border-slate-200">
        
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Audio & Video Aufnahmen</h2>
          <p className="text-sm text-slate-500 mt-0.5">Erlebe unsere musikalischen Beiträge im direkten Player.</p>
        </div>

        {mediaItems.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">Aktuell sind keine Tonbeiträge oder Videos im Google Doc hinterlegt.</p>
        ) : (
          <div className="space-y-12">
            {mediaItems.map((item, index) => {
              const embedUrl = getYouTubeEmbedUrl(item.youtubeUrl);

              return (
                <div key={index} className={`space-y-4 ${index !== 0 ? 'pt-8 border-t border-slate-100' : ''}`}>
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">YouTube Beitrag</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">{item.titel}</h3>
                  </div>

                  {/* YouTube Video Player oder Vorschaubild */}
                  {embedUrl ? (
                    <div className="relative w-full aspect-video bg-slate-900 border border-slate-200 shadow-sm overflow-hidden">
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
                      <div className="relative w-full h-56 md:h-80 bg-slate-100 border border-slate-200 overflow-hidden">
                        <img 
                          src={item.vorschaubild} 
                          alt={item.titel} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  )}

                  {/* Beschreibung */}
                  {item.beschreibung && (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.beschreibung}</p>
                  )}

                  {/* Externer Link Fallback */}
                  <div>
                    <a 
                      href={item.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
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

    </div>
  );
}