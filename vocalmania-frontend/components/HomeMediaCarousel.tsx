"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface MediaItem {
  id: string;
  titel: string;
  link: string;
  typ: string;
  vorschaubild?: string | null;
  beschreibung: string;
}

interface HomeMediaCarouselProps {
  items: MediaItem[];
}

export default function HomeMediaCarousel({ items }: HomeMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  if (!items || items.length === 0) return null;

  const totalSlides = items.length + 1;

  return (
    <div className="space-y-3">
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] rounded-3xl"
      >
        {items.map((item) => (
          <div key={item.id} className="w-full shrink-0 snap-center">
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-gradient-to-br from-black/30 via-black/40 to-black/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl cursor-pointer"
            >
              {/* Bildbereich: scale-110 und -translate-y-4 kaschieren die YouTube-schwarzen Ränder oben/unten */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black/40">
                {item.vorschaubild ? (
                  <img 
                    src={item.vorschaubild} 
                    alt={item.titel} 
                    className="w-full h-full object-cover scale-110 -translate-y-3 transform group-hover:scale-115 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 flex items-center justify-center text-4xl">
                    ▶️
                  </div>
                )}
                {/* Badge */}
                <span className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 font-semibold rounded-full border border-white/10 shadow-md">
                  {item.typ || "YouTube"}
                </span>
              </div>

              {/* Titel & Beschreibung unten */}
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.titel}
                  </h3>
                  <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
                {item.beschreibung && (
                  <p className="text-xs text-indigo-200/70 line-clamp-2 leading-relaxed">
                    {item.beschreibung}
                  </p>
                )}
              </div>
            </a>
          </div>
        ))}

        {/* Letzte Kachel: Mediathek öffnen */}
        <div className="w-full shrink-0 snap-center">
          <Link 
            href="/media"
            className="group flex flex-col justify-between bg-gradient-to-br from-indigo-950/60 via-black/50 to-black/70 backdrop-blur-md rounded-3xl p-8 h-full min-h-[360px] shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl"
          >
            <div>
              <span className="text-3xl mb-2 inline-block">🎵</span>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                Mediathek-Archiv
              </h3>
              <p className="text-xs text-indigo-200/70 mt-1 max-w-xs">
                Alle Audioaufnahmen, YouTube-Videos, Noten und Chor-Arrangements im Überblick.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between border-t border-white/10 mt-4">
              <span className="text-xs font-bold text-indigo-200">Zur Mediathek</span>
              <span className="bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-md">
                Öffnen &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Dots */}
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