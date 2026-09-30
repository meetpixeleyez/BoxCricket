import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#047857",
};

export const metadata: Metadata = {
  title: "BoxKhel - Surat's Premier Box Cricket Platform",
  description: "Book box cricket turfs across Surat (Mota Varachha, Adajan, Vesu, Katargam), find missing players, and challenge rival teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-900 min-h-screen flex justify-center selection:bg-emerald-500 selection:text-white`}>
        <AppProvider>
          <div className="app-container">
            <Header />
            <main className="flex-1 pb-24">
              {children}
            </main>
            <Navigation />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
