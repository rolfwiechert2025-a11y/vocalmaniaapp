import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocalmania",
  description: "A-cappella-Ensemble",
  manifest: "/manifest.json", // <--- Hier wird die Manifest-Datei verknüpft
};

export const viewport: Viewport = {
  themeColor: "#0b0a1f", // Passt sich nahtlos an deinen dunklen Hintergrund an
  viewportFit: "cover",  // Ermöglicht das Zeichnen bis hinter die Statusleiste (Edge-to-Edge)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-white antialiased selection:bg-indigo-500 selection:text-white pt-[env(safe-area-inset-top)]">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}