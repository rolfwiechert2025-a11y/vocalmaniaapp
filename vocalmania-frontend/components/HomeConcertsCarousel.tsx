"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface KonzertItem {
  id: string;
  titel: string;
  datum: string;
  ort: string;
  link: string;
  vorschaubild?: string;
  beschreibung: string;
}

interface HomeConcertsCarouselProps {
  konzerte: KonzertItem[];
}

export default function HomeConcertsCarousel({ konzerte }: HomeConcertsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const itemWidth = scrollContainerRef.current.offsetWidth * 0.92;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(Math.min(Math.max(newIndex, 0), konzerte.length));
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

  if (konzerte.length === 0) return null;

  const totalSlides = konzerte.length + 1;

  return (
    <div className="space-y-3">
      {/* Scroll-Container mit exaktem Peek-Effekt für die nächste Kachel */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] rounded-3xl gap-4"
      >
        {konzerte.map((item) => (
          <div key={item.id} className="w-[95%] sm:w-[88%] md:w-[80%] shrink-0 snap-start">
            <Link 
              href={`/konzerte/${item.id}`}
              className="group flex flex-col justify-between bg-gradient-to-br from-black/30 via-black/40 to-black/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl h-full min-h-[400px]"
            >
              {/* Vorschaubild */}
              <div className="relative h-52 sm:h-64 w-full bg-black/40 overflow-hidden shrink-0">
                {item.vorschaubild ? (
                  <img 
                    src={item.vorschaubild} 
                    alt={item.titel} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 flex items-center justify-center text-3xl">
                    🎶
                  </div>
                )}
                <span className="absolute top-4 right-4 bg-violet-600/80 backdrop-blur-md text-white text-xs px-3 py-1 font-semibold rounded-full border border-white/10 shadow-md">
                  {item.datum}
                </span>
              </div>

              {/* Textbereich mit einheitlicher Verteilung */}
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.titel}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-300 mt-1">📍 {item.ort}</p>
                </div>
                <p className="text-xs text-indigo-200/70 line-clamp-2 leading-relaxed">
                  {item.beschreibung}
                </p>
              </div>
            </Link>
          </div>
        ))}

        {/* Letzte Kachel: Alle Konzerte */}
        <div className="w-[92%] sm:w-[85%] md:w-[75%] shrink-0 snap-start">
          <Link 
            href="/konzerte"
            className="group flex flex-col items-center justify-center text-center bg-gradient-to-br from-violet-950/60 via-black/50 to-black/70 backdrop-blur-md rounded-3xl p-10 h-full min-h-[400px] shadow-xl border border-white/10 transition-all duration-300 hover:shadow-2xl"
          >
            <span className="text-4xl mb-3">📅</span>
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
              Alle Termine & Konzerte
            </h3>
            <p className="text-xs text-indigo-200/70 max-w-xs mb-6">
              Verpassen Sie keinen Auftritt mehr. Alle Konzerttermine und Details im Überblick.
            </p>
            <span className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors shadow-md">
              Alle Termine &rarr;
            </span>
          </Link>
        </div>
      </div>

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