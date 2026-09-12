import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HERO-BEREICH MIT BILD, SCHRIFTZÜGEN & INTEGRIERTEN SOCIAL ICONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Hauptbild aus dem public-Ordner mit integrierten Social Icons */}
        <div className="relative w-full h-80 md:h-[420px] bg-slate-900">
          <Image 
            src="/DSC_9566-2-fertig.jpg" 
            alt="Vocalmania Chor" 
            fill 
            className="object-cover"
            priority
          />
          {/* Dunkler Farbverlauf unten im Bild, damit die Icons perfekt lesbar sind */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          {/* Runde Social Media Icons direkt im Bild unten rechts */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2.5">
            
            {/* Facebook (Blau) */}
            <a 
              href="https://www.facebook.com/Vocalmaniasingingandmore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram (Gradient Pink/Orange) */}
            <a 
              href="https://www.instagram.com/vocalmaniasingingandmore/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* YouTube (Rot) */}
            <a 
              href="https://www.youtube.com/channel/UCHFB5CU4-buP3YNe3bP0k-g?app=desktop" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* TikTok (Schwarz/Neon) */}
            <a 
              href="https://tiktok.com/@vocalmaniaeventch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-slate-700"
              aria-label="TikTok"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>

            {/* E-Mail (Indigo) */}
            <a 
              href="mailto:info@vocalmania-isenburg.com"
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              aria-label="E-Mail schreiben"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.717v15.43h24v-15.43l-12 9.717z"/>
              </svg>
            </a>

          </div>
        </div>

        {/* Text-Bereich unter dem Bild: Head & Sub Head */}
        <div className="p-6 md:p-8 text-center space-y-1">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Vocalmania
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-600 tracking-[0.25em]">
            singing and more ...
          </p>
        </div>
      </div>

      {/* 2. WILLKOMMEN / TEXT-BEREICH */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Herzlich willkommen bei Vocalmania</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Wir sind ein moderner A-cappella-Chor aus Horb-Isenburg und begeistern unser Publikum mit einem abwechslungsreichen Repertoire aus Pop, Rock und mitreißenden Musical-Melodien. 
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Schauen Sie sich auf unserer Website um, erfahren Sie mehr über unsere anstehenden Konzerte oder nehmen Sie direkt Kontakt mit uns auf. Wir freuen uns auf Sie!
        </p>

        {/* Call-to-Action Link / Bullet zu den anstehenden Konzerten */}
        <div className="pt-2">
          <Link 
            href="/konzerte" 
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:translate-x-1"
          >
            <span>🎶</span> Anstehende Konzerte & Termine entdecken &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}