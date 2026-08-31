import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "STEAM Hub",
  description: "A personal teaching dashboard for Design & Technology.",
};

// Avoids a flash of the wrong theme before hydration.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('steamhub-theme');
    var theme = stored === 'dark' || stored === 'light' ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-ink)" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
