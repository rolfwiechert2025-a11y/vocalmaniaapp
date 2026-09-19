"use client";

import Link from "next/link";
import { useState } from "react";

interface ImageItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface AlbumViewClientProps {
  albumTitle: string;
  images?: ImageItem[];
  backUrl?: string;
}

export default function AlbumViewClient({ 
  albumTitle, 
  images = [], 
  backUrl = "/bilder" 
}: AlbumViewClientProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const safeImages = images || [];

  return (
    <div className="space-y-6">
      
      {/* HEADER & ZURÜCK-BUTTON */}
      <div className="space-y-4">
        <Link 
          href={backUrl} 
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 transition-all shadow-sm cursor-pointer"
        >
          &larr; Zurück zur Übersicht
        </Link>

        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                Interner Bereich
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white">{albumTitle}</h1>
          </div>
          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3.5 py-1 rounded-full border border-white/10">
            {safeImages.length} {safeImages.length === 1 ? "Bild" : "Bilder"}
          </span>
        </div>
      </div>

      {/* BILDER RASTER */}
      {safeImages.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
          In diesem Album befinden sich aktuell keine Bilder.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {safeImages.map((image) => (
            <div 
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-lg cursor-pointer hover:border-indigo-400 transition-all"
            >
              <img 
                src={image.imageUrl} 
                alt={image.name}
                loading="lazy"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
              
              {/* Overlay beim Hover mit Aktionen */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                <span className="text-[10px] text-white font-medium truncate">
                  🔍 Vergrößern
                </span>
                
                {/* Direkter Download-Button */}
                <a
                  href={image.imageUrl}
                  download={image.name}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full backdrop-blur-md transition-all text-xs cursor-pointer"
                  title="Bild herunterladen"
                >
                  📥
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LICHTBOX / GROSSANSICHT MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Schließen & Download Buttons oben */}
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={selectedImage.imageUrl}
                download={selectedImage.name}
                className="text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-indigo-400/30 shadow-md flex items-center gap-1 cursor-pointer"
              >
                📥 Herunterladen
              </a>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                ✕ Schließen
              </button>
            </div>

            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.name}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
            <p className="text-xs text-indigo-200/80 mt-3 truncate">
              {selectedImage.name}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}