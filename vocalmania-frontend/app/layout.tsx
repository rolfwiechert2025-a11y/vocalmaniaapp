import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocalmania",
  description: "A-cappella-Ensemble",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0b0a1f",
  viewportFit: "cover", // Zwingt den Browser in den Edge-to-Edge-Modus
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      {/* Ohne pt-[env(...)] am body zieht sich die App nun komplett nach ganz oben durch */}
      <body className="bg-slate-950 text-white antialiased selection:bg-indigo-500 selection:text-white">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}