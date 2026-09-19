"use client";

import { useState } from "react";
import Link from "next/link";

interface ImageItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface AlbumViewClientProps {
  albumTitle: string;
  images?: ImageItem[];
  backUrl?: string; // Neu: Flexibel für public (/bilder) oder intern (/intern/bilder)
}

export default function AlbumViewClient({ 
  albumTitle, 
  images = [], 
  backUrl = "/bilder" 
}: AlbumViewClientProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const safeImages = images || [];

  // Organische, überlappendungsfreie Kastenhöhen im Mosaik-Look
  const getCardStyle = (index: number) => {
    const pattern = index % 5;
    if (pattern === 0) return "h-80 sm:h-96"; // Highlight-Kachel
    if (pattern === 2) return "h-72";      // Mittleres Format
    return "h-60";                         // Standard-Kachel
  };

  return (
    <div className="min-h-screen text-white pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Zurück-Navigation */}
        <div>
          <Link href={backUrl} className="inline-flex items-center text-xs font-bold text-indigo-300 hover:text-white transition-colors cursor-pointer">
            &larr; Zurück zur Album-Übersicht
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{albumTitle}</h1>
            <p className="text-xs text-indigo-200/70 mt-0.5">Klicke auf ein Bild, um es in der Großansicht zu öffnen</p>
          </div>
          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
            {safeImages.length} {safeImages.length === 1 ? "Bild" : "Bilder"}
          </span>
        </div>

        {/* Mosaik-Grid */}
        {safeImages.length === 0 ? (
          <div className="bg-black/20 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
            In diesem Album befinden sich aktuell keine Bilder.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
            {safeImages.map((img, index) => {
              const heightClass = getCardStyle(index);
              return (
                <div 
                  key={img.id}
                  onClick={() => setSelectedImage(img)}
                  className={`group relative bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:bg-black/40 hover:scale-[1.01] mb-4 break-inside-avoid ${heightClass}`}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.name} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-xs font-semibold tracking-wide drop-shadow-md flex items-center gap-1.5">
                      🔍 Vergrößern
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INTERNES ZOOM-MODAL (LIGHTBOX) */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 animate-fadeIn overflow-y-auto"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl w-full flex flex-col items-center justify-center space-y-3 my-auto pt-16 sm:pt-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Großbild-Container mit absolut platzierten Buttons */}
              <div className="relative w-full h-[65vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center p-2">
                
                {/* Die runden Buttons oben rechts */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                  <a
                    href={selectedImage.imageUrl}
                    download={selectedImage.name || "vocalmania-foto.jpg"}
                    onClick={(e) => e.stopPropagation()}
                    className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer text-base"
                    title="Bild herunterladen"
                  >
                    📥
                  </a>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105 cursor-pointer border border-white/30 text-base"
                    title="Schließen (Esc)"
                  >
                    ✕
                  </button>
                </div>

                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Bildtitel */}
              <p className="text-white/80 text-xs font-medium tracking-wide text-center pb-4">
                {selectedImage.name}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}