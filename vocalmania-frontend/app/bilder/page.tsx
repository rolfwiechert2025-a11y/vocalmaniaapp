import Image from "next/image";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";

interface AlbumItem {
  titel: string;
  link: string;
  vorschaubild: string | null;
  beschreibung: string;
}

// Funktion zum Auslesen des Album-Google-Docs
async function fetchAlbumsFromDoc(fileId: string): Promise<AlbumItem[]> {
  if (!fileId) return [];

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });

    const rawText = typeof response.data === 'string' ? response.data : '';
    
    // Alben anhand des Tags [Album] auftrennen
    const blocks = rawText.split(/(?=\[Album\])/i).filter(b => b.includes('[Album]'));

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

      return {
        titel: getField('Titel') || 'Unbenanntes Album',
        link: getField('Link') || '#',
        vorschaubild,
        beschreibung: getField('Beschreibung'),
      };
    });
  } catch (error) {
    console.error(`Fehler beim Laden des Album-Docs (${fileId}):`, error);
    return [];
  }
}

export default async function BilderPage() {
  // Lädt die Alben aus dem Google Doc, dessen ID in .env.local als PUBLIC_ALBUMS_DOC_ID hinterlegt ist
  const albums = await fetchAlbumsFromDoc(process.env.PUBLIC_ALBUMS_DOC_ID || "");

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
              Bildergalerie
            </h1>
            <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
              Eindrücke & Momente
            </p>
          </div>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH (Ohne abgerundete Ecken) */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-8 border-b border-slate-200">
        
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Unsere Fotoalben</h2>
          <p className="text-sm text-slate-500 mt-0.5">Klicken Sie auf ein Album, um alle Bilder bei Google Photos anzusehen.</p>
        </div>

        {albums.length === 0 ? (
          <p className="text-sm text-slate-500 py-6">Aktuell sind keine öffentlichen Alben hinterlegt.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {albums.map((album, index) => (
              <a 
                key={index} 
                href={album.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-slate-50 border border-slate-200 overflow-hidden hover:border-indigo-600 transition-all shadow-sm"
              >
                {/* Vorschaubild des Albums */}
                <div className="relative h-60 bg-slate-200 overflow-hidden">
                  {album.vorschaubild ? (
                    <img 
                      src={album.vorschaubild} 
                      alt={album.titel} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Kein Vorschaubild</div>
                  )}
                </div>

                {/* Beschreibungs-Bereich */}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    <span>{album.titel}</span>
                    <span className="text-indigo-600 text-sm">&rarr;</span>
                  </h3>
                  {album.beschreibung && (
                    <p className="text-sm text-slate-600 leading-relaxed">{album.beschreibung}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}