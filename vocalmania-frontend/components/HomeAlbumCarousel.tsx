"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface AlbumItem {
  id: string;
  titel: string;
  link: string;
  vorschaubild: string | null;
  beschreibung: string;
  bildAnzahl: number;
}

interface HomeAlbumCarouselProps {
  albums: AlbumItem[];
}

export default function HomeAlbumCarousel({ albums }: HomeAlbumCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.offsetWidth * 0.92;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(Math.min(Math.max(newIndex, 0), albums.length));
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slide = container.children[index] as HTMLElement;
      if (slide) {
        container.scrollTo({
          left: slide.offsetLeft - container.offsetLeft,
          behavior: "smooth",
        });
        setCurrentIndex(index);
      }
    }
  };

  if (albums.length === 0) return null;

  const totalSlides = albums.length + 1;

  return (
    <div className="space-y-3">
      {/* Scroll-Container ohne äußeres Padding, damit die aktive Kachel exakt sitzt */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] rounded-3xl gap-4"
      >
        {albums.map((album) => (
          /* Kachel nimmt fast die volle Breite ein (w-[92%]), so dass rechts ein schmaler Streifen der nächsten Kachel bleibt */
          <div key={album.id} className="w-[95%] sm:w-[88%] md:w-[80%] shrink-0 snap-start">
            <Link 
              href={album.link}
              className="group block bg-gradient-to-br from-black/30 via-black/40 to-black/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="relative h-64 sm:h-80 bg-black/40 overflow-hidden">
                {album.vorschaubild ? (
                  <img 
                    src={album.vorschaubild} 
                    alt={album.titel} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-indigo-200/40 text-xs">Kein Bild</div>
                )}
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 font-semibold rounded-full border border-white/10">
                  {album.bildAnzahl} {album.bildAnzahl === 1 ? "Bild" : "Bilder"}
                </span>
              </div>
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {album.titel}
                  </h3>
                  <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
                {album.beschreibung && (
                  <p className="text-xs text-indigo-200/70 line-clamp-2 leading-relaxed">
                    {album.beschreibung}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}

        {/* Letzte Kachel: Fotoarchiv */}
        <div className="w-[92%] sm:w-[85%] md:w-[75%] shrink-0 snap-start">
          <Link 
            href="/bilder"
            className="group flex flex-col justify-between bg-gradient-to-br from-indigo-950/60 via-black/50 to-black/70 backdrop-blur-md rounded-3xl p-8 h-full min-h-[360px] shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl"
          >
            <div>
              <span className="text-3xl mb-2 inline-block">🖼️</span>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Fotoarchiv
              </h3>
              <p className="text-xs text-indigo-200/70 mt-1 max-w-xs">
                Entdecken Sie sämtliche Fotoalben vergangener Konzerte, Proben und Ausflüge.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-white/10 mt-4">
              <span className="text-xs font-bold text-indigo-200">Alle Alben ansehen</span>
              <span className="bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-md">
                Öffnen &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Indikatoren im gewohnten Look */}
      <div className="flex justify-center items-center gap-1.5 pt-1">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === index 
                ? "w-6 h-2 bg-indigo-500 shadow-md" 
                : "w-2 h-2 bg-white/20 hover:bg-white/40"
            }`}
            title={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}