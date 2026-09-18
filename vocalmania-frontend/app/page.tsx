import Image from "next/image";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleauth";
import { getPublicEvents } from "@/lib/events";
import { fetchMediaFromDoc } from "@/app/media/page";
import HomeAlbumCarousel from "@/components/HomeAlbumCarousel";
import HomeConcertsCarousel from "@/components/HomeConcertsCarousel";
import HomeMediaCarousel from "@/components/HomeMediaCarousel";

interface AlbumItem {
  id: string;
  titel: string;
  link: string;
  vorschaubild: string | null;
  beschreibung: string;
  bildAnzahl: number;
}

// Alben aus Google Drive laden
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

// Exakte YouTube-Thumbnail-Ermittlung
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

export default async function Home() {
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

  // Media-Einträge mappen mit erzwungener YouTube-Thumbnail-Priorität
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

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. GROSSES CHOR-BILD ALS HERO-KACHEL */}
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

      {/* 2. KARUSSELL: FOTOALBEN */}
      <HomeAlbumCarousel albums={albums} />

      {/* 3. KARUSSELL: KONZERTE */}
      {echteKonzerte.length > 0 && (
        <HomeConcertsCarousel konzerte={echteKonzerte} />
      )}

      {/* 4. KARUSSELL: MEDIA */}
      {echteMedia.length > 0 && (
        <HomeMediaCarousel items={echteMedia} />
      )}

    </div>
  );
}