import type { Metadata } from "next";
import { Source_Serif_4, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/store";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Overlays } from "@/components/overlays";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://www.archivostem.com";
const SITE_DESC =
  "Una biblioteca documental audiovisual de conversaciones con personas detrás de la ciencia, la tecnología, la ingeniería, el arte, la cultura, la industria y las ideas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Archivo STEAM — Preservar historias. Compartir conocimiento.",
    template: "%s · Archivo STEAM",
  },
  description: SITE_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Archivo STEAM",
    locale: "es_MX",
    url: SITE_URL,
    title: "Archivo STEAM — Preservar historias. Compartir conocimiento.",
    description: SITE_DESC,
  },
  twitter: { card: "summary_large_image", title: "Archivo STEAM", description: SITE_DESC },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <StoreProvider>
          <a href="#main" className="skip-link">Saltar al contenido</a>
          <SiteHeader />
          <main id="main" className="light">
            {children}
          </main>
          <SiteFooter />
          <Overlays />
        </StoreProvider>
      </body>
    </html>
  );
}
