import Image from "next/image";

export default function KontaktPage() {
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
            Kontakt
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
            Wir freuen uns auf Sie
          </p>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH (Ohne abgerundete Ecken) */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-10 border-b border-slate-200">
        
        {/* Sektion 1: Anschrift & Adresse */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Postanschrift</h2>
            <p className="text-sm text-slate-500 mt-0.5">Hier erreichen Sie uns postalisch</p>
          </div>
          
          <div className="text-sm text-slate-700 space-y-1 font-medium">
            <p className="font-bold text-slate-900">Vocalmania – Singing and more</p>
            <p>Heideweg 2</p>
            <p>72160 Horb-Isenburg</p>
          </div>
        </div>

        {/* Sektion 2: Direktkontakt */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Direkter Draht</h2>
            <p className="text-sm text-slate-500 mt-0.5">Rufen Sie uns an oder schreiben Sie uns</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Telefon</p>
              <a href="tel:+4915752429035" className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block">
                +49 1575 2429035
              </a>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">E-Mail</p>
              <a href="mailto:info@vocalmania-isenburg.com" className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block break-all">
                info@vocalmania-isenburg.com
              </a>
            </div>
          </div>
        </div>

        {/* Sektion 3: Social Media */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Social Media</h2>
            <p className="text-sm text-slate-500 mt-0.5">Folgen Sie uns auf unseren Kanälen</p>
          </div>
          
          <p className="text-sm text-slate-700">
            Besuchen Sie uns auch auf Facebook, Instagram, YouTube und TikTok, um keine Neuigkeiten oder Auftritte zu verpassen. Die direkten Links finden Sie jederzeit in unserem Menü oder auf der Startseite.
          </p>
        </div>

      </div>

    </div>
  );
}