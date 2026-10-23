import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/bai-jamjuree/600.css";
import "@fontsource/bai-jamjuree/700.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { ServiceWorker } from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: { default: "คลังรู้", template: "%s · คลังรู้" },
  description: "เรียนทุกวิชาตามลำดับความรู้ ไม่แบ่งระดับชั้น มีเนื้อหา โจทย์ และการทบทวนที่ปรับตามผู้เรียน",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/favicon-32.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0a6b60" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ServiceWorker />
        <NavBar />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
