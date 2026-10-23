import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-thai/400.css";
import "@fontsource/ibm-plex-sans-thai/500.css";
import "@fontsource/ibm-plex-sans-thai/600.css";
import "@fontsource/bai-jamjuree/600.css";
import "@fontsource/bai-jamjuree/700.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: { default: "คลังรู้", template: "%s · คลังรู้" },
  description: "เรียนทุกวิชาตามลำดับความรู้ ไม่แบ่งระดับชั้น มีเนื้อหา โจทย์ และการทบทวนที่ปรับตามผู้เรียน",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <NavBar />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
