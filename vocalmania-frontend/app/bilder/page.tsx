import Image from "next/image";

export default function BilderPage() {
  return (
    <div className="space-y-0">
      
      {/* 1. HERO-BEREICH (Volle Breite ohne Rahmen) */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 overflow-hidden">
        <Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Überschrift im Bild */}
        <div className="absolute bottom-6 left-6 md:left-10 z-10 text-white space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Bildergalerie
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
            Eindrücke & Momente
          </p>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH (Ohne abgerundete Ecken) */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-10 border-b border-slate-200">
        
        {/* Sektion 1 */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Auftritte & Konzerte</h2>
            <p className="text-sm text-slate-500 mt-0.5">Musikalische Highlights auf der Bühne</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-60 bg-slate-100 border border-slate-200 overflow-hidden">
              <Image src="/DSC_9566-2-fertig.jpg" alt="Konzert Auftritt" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative h-60 bg-slate-100 border border-slate-200 overflow-hidden">
              <Image src="/DSC_9566-2-fertig.jpg" alt="Chor auf der Bühne" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Sektion 2 */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Hinter den Kulissen</h2>
            <p className="text-sm text-slate-500 mt-0.5">Probenarbeit und Gemeinschaft</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-60 bg-slate-100 border border-slate-200 overflow-hidden">
              <Image src="/DSC_9566-2-fertig.jpg" alt="Probe" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="relative h-60 bg-slate-100 border border-slate-200 overflow-hidden">
              <Image src="/DSC_9566-2-fertig.jpg" alt="Chorprobe" fill className="object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}