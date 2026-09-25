import Image from "next/image";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";
import { getPublicEvents } from "@/lib/events";
import { fetchMediaFromDoc } from "@/app/media/page";
import HomeAlbumCarousel from "@/components/HomeAlbumCarousel";
import HomeConcertsCarousel from "@/components/HomeConcertsCarousel";
import HomeMediaCarousel from "@/components/HomeMediaCarousel";
import Link from "next/link";

interface AlbumItem {
  id: string;
  titel: string;
  link: string;
  vorschaubild: string | null;
  beschreibung: string;
  bildAnzahl: number;
}

async function fetchAlbumsFromDrive(): Promise<AlbumItem[]> {
  const rootFolderId = process.env.PUBLIC_PICTURES_ROOT_ID;
  if (!rootFolderId) return [];

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });

    const foldersRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, description)',
      orderBy: 'name desc',
      pageSize: 8,
    });

    const subFolders = foldersRes.data.files || [];

    const albumPromises = subFolders.map(async (folder): Promise<AlbumItem | null> => {
      if (!folder.id || !folder.name) return null;

      const filesRes = await drive.files.list({
        q: `'${folder.id}' in parents and (mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp') and trashed = false`,
        fields: 'files(id, name)',
        pageSize: 100,
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
        beschreibung: folder.description || 'Fotoalbum',
        bildAnzahl: images.length,
      };
    });

    const results = await Promise.all(albumPromises);
    return results.filter((album): album is AlbumItem => album !== null);
  } catch (error) {
    console.error("Fehler beim Laden der Startseiten-Alben:", error);
    return [];
  }
}

function getYouTubeThumbnail(url: string): string | null {
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

// Props mit Suchparameter, den die AppShell übergeben kann
interface HomeProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams?.q || "").toLowerCase();

  const albums = await fetchAlbumsFromDrive();
  const calendarEvents = await getPublicEvents();
  const rawMediaItems = await fetchMediaFromDoc(process.env.PUBLIC_MEDIA_DOC_ID || "");

  // Konzerte mappen
  const echteKonzerte = calendarEvents.map((event, index) => {
    const startDate = new Date(event.start?.dateTime || event.start?.date || "");
    const formattedDate = !isNaN(startDate.getTime()) 
      ? startDate.toLocaleDateString("de-DE", { day: '2-digit', month: 'short', year: 'numeric' })
      : "Demnächst";

    return {
      id: event.id || `event-${index}`,
      titel: event.summary || "Konzert",
      datum: formattedDate,
      ort: event.resolvedLocation || "Ort wird bekannt gegeben",
      link: "/konzerte", 
      vorschaubild: event.imageUrl || undefined, 
      beschreibung: event.resolvedShortDesc || "Keine Beschreibung verfügbar."
    };
  });

  // Media-Einträge mappen
  const echteMedia = rawMediaItems.map((item, index) => {
    let thumbnail = getYouTubeThumbnail(item.youtubeUrl);
    if (!thumbnail && item.vorschaubild) {
      thumbnail = item.vorschaubild;
    }

    return {
      id: `media-${index}`,
      titel: item.titel,
      typ: "YouTube",
      link: item.youtubeUrl || "/media",
      vorschaubild: thumbnail,
      beschreibung: item.beschreibung || "Tonbeitrag oder Video von Vocalmania."
    };
  });

  // Filterung anwenden, wenn im Header etwas eingetippt wurde
  const filteredAlbums = albums.filter(a => 
    a.titel.toLowerCase().includes(searchQuery) || a.beschreibung.toLowerCase().includes(searchQuery)
  );
  const filteredKonzerte = echteKonzerte.filter(k => 
    k.titel.toLowerCase().includes(searchQuery) || k.ort.toLowerCase().includes(searchQuery) || k.beschreibung.toLowerCase().includes(searchQuery)
  );
  const filteredMedia = echteMedia.filter(m => 
    m.titel.toLowerCase().includes(searchQuery) || m.beschreibung.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. GROSSES CHOR-BILD ALS HERO-KACHEL (Wird bei Suche ausgeblendet, um Platz für Ergebnisse zu machen) */}
      {!searchQuery && (
        <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
          <Image 
            src="/DSC_9566-2-fertig.jpg" 
            alt="Vocalmania Chor" 
            fill 
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#1e1b4b]/40 to-transparent"></div>
          
          <div className="absolute bottom-6 left-0 right-0 z-10 px-6 md:px-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full">
              A-cappella-Ensemble
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Vocalmania
            </h1>
            <p className="text-xs md:text-sm text-indigo-200/90 max-w-lg drop-shadow">
              Willkommen im digitalen Zuhause unseres Chors. Erleben Sie Musik, Bilder und unvergessliche Momente.
            </p>
          </div>
        </div>
      )}

      {/* Such-Info, falls aktiv */}
      {searchQuery && (
        <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
          <p className="text-xs text-indigo-200">
            Suchergebnisse für: <span className="font-bold text-white">„{searchQuery}“</span>
          </p>
<Link href="/" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl text-white transition-colors">
            Zurücksetzen ✕
          </Link>
        </div>
      )}

      {/* 2. KARUSSELL: FOTOALBEN */}
      {filteredAlbums.length > 0 && (
        <HomeAlbumCarousel albums={filteredAlbums} />
      )}

      {/* 3. KARUSSELL: KONZERTE */}
      {filteredKonzerte.length > 0 && (
        <HomeConcertsCarousel konzerte={filteredKonzerte} />
      )}

      {/* 4. KARUSSELL: MEDIA */}
      {filteredMedia.length > 0 && (
        <HomeMediaCarousel items={filteredMedia} />
      )}

      {searchQuery && filteredAlbums.length === 0 && filteredKonzerte.length === 0 && filteredMedia.length === 0 && (
        <div className="text-center py-16 text-indigo-200/60 text-sm">
          Keine passenden Einträge auf der Startseite gefunden.
        </div>
      )}

    </div>
  );
}